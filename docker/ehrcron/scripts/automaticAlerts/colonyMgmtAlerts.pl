#!/usr/bin/env perl

=head1 DESCRIPTION

This script is designed to run as a cron job.  It will query a number of tables an email a report.
The report is designed to identify potential problems with the colony, primarily related to weights, housing
and assignments.


=head1 LICENSE

This package and its accompanying libraries are free software; you can
redistribute it and/or modify it under the terms of the GPL (either
version 1, or at your option, any later version) or the Artistic
License 2.0.

=head1 AUTHOR

Ben Bimber

=cut

#config options:
my $baseUrl = $ENV{'LK_BASE_URL'};
my $studyContainer = 'WNPRC/EHR/';

my $notificationtypes = 'Colony Management Alerts';
my $mail_server = $ENV{'MAIL_SERVER'};

#emails will be sent from this address
my $from = 'ehr-no-not-reply@primate.wisc.edu';


############Do not edit below this line
use strict;
use warnings;
use LabKey::Query;
use Net::SMTP;
use MIME::Lite;
use Data::Dumper;
use Time::localtime;
use File::Touch;
use File::Spec;
use File::Basename;
use Cwd 'abs_path';
use List::MoreUtils qw/ uniq /;

# Find today's date
my $tm = localtime;
my $datetimestr=sprintf("%04d-%02d-%02d at %02d:%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);
my $datestr=sprintf("%04d-%02d-%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday);

my $yesterday = localtime( ( time() - ( 24 * 60 * 60 ) ) );
$yesterday = sprintf("%04d-%02d-%02d", $yesterday->year+1900, ($yesterday->mon)+1, $yesterday->mday);

my $tomorrow = localtime( ( time() + ( 24 * 60 * 60 ) ) );
$tomorrow = sprintf("%04d-%02d-%02d", $tomorrow->year+1900, ($tomorrow->mon)+1, $tomorrow->mday);


my $email_html = "This email contains a series of automatic alerts about the WNPRC colony.  It was run on: $datetimestr.<p>";
my $results;

#first we find all living animals without a weight:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -filterArray => [
        ['calculated_status', 'eq', 'Alive'],
        ['Id/MostRecentWeight/MostRecentWeightDate', 'isblank', ''],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: The following animals do not have a weight:</b><br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.calculated_status~eq=Alive&query.Id/MostRecentWeight/MostRecentWeightDate~isblank"."'>Click here to view these animals</a></p>\n";
    $email_html .= '<hr>';
}


#then we find all occupied cages without dimensions:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -queryName => 'missingCages',
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: The following cages have animals, but do not have known dimensions:</b><br>";
		
    foreach my $row (@{$results->{rows}}){   	
        $email_html .= $row->{'room'}."/".$row->{'cage'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr&query.queryName=missingCages"."'>Click here to view the problem cages</a></p>\n";
    $email_html .= "<a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr_lookups&query.queryName=cage"."'>Click here to edit the cage list and fix the problem</a></p>\n";

    $email_html .= '<hr>';
}

#then we list all animals in pc:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Housing',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'eq', 'Alive'],
    	['cond', 'eq', 'pc'],
    	['enddate', 'isblank', ''],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){	
	my $map = {};
    my $tempHTML = '';

    foreach my $row (@{$results->{rows}}){   	
        
        if(!$$map{$row->{'room'}}){
			$$map{$row->{'room'}} = {};        	
        } 
        
        my $cage = $row->{'cage'};
        if ($cage =~ /^\d+$/ ){
        	$cage = $cage + 0; #convert to number
        	$$map{$row->{'room'}}{$cage} = [] unless $$map{$row->{'room'}}{$cage};
        	push(@{$$map{$row->{'room'}}{$cage}}, $row->{'Id'}); 	
        }
    };
    
    foreach my $room (sort keys %$map){
    	my $roommap = $$map{$room};
    	foreach my $cage (sort keys %$roommap){
    		if(!$$roommap{$cage - 1} && !$$roommap{$cage + 1}){
    			$tempHTML .= join(';', @{$$roommap{$cage}}).': '.$room."/".$cage."<br>";		
    		}     		 			
    	}
    }

	if($tempHTML){
		$email_html .= "<b>WARNING: The following animals are listed in protected contact, but do not appear to have an adjacent pc animal:</b><br>".$tempHTML;		
	    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Housing&query.cond~eq=pc&query.enddate~isblank="."'>Click here to view all pc animals</a></p>\n";
    	$email_html .= '<hr>';
	}
}


#then we find all records with potential housing condition problems
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'housingConditionProblems',
    -viewName => 'Problems',
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." housing records with potential condition problems:</b><br>";

	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=housingConditionProblems&query.viewName=Problems"."'>Click here to view these records</a></p>\n";
    $email_html .= "<a href='".$baseUrl."ehr/".$studyContainer."updateQuery.view?schemaName=study&query.queryName=Housing&query.Id~in=".join(';', @ids)."&query.enddate~isblank'>Click here to edit housing to fix the problems</a><p>";

    #$email_html .= join('<br>', @ids);
    $email_html .= '<hr>';
}


#then we find all animals with cage size problems
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'CageReview',
    -viewName => 'Problem Cages',
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: The following cages are too small for the animals currently in them:</b><br>";
	
    foreach my $row (@{$results->{rows}}){ 	
        $email_html .= $row->{'Location'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=CageReview&query.viewName=Problem Cages'>Click here to view these cages</a></p>\n";    
    $email_html .= '<hr>';
}

#then we find all animals lacking any assignments
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -viewName => 'No Active Assigns',
    -requiredVersion => 8.3,
    -debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." living animals without any active assignments:</b><br>";

	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'Id'});
        $email_html .= $row->{'Id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=No Active Assigns'>Click here to view these animals</a></p>\n";
    $email_html .= '<hr>';
}


#we find any active assignment where the animal is not alive
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Assignment',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],    			    	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." active assignments for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Assignment&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}	

#we find any active assignment where the project lacks a valid protocol
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Assignment',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],
		['protocol/protocol', 'isblank', ''],    			    	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." active assignments to a project without a valid protocol.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Assignment&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive&query.protocol/protocol~isblank"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}

#we find any duplicate active assignments
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'duplicateAssignments',
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals double assigned to the same project.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=duplicateAssignments"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}



#we find animals with hold codes, but not on pending 
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',    
    -filterArray => [
    	['hold', 'isnonblank', ''],
		['Id/AssignmentSummary/NumPendingAssignments', 'eq', 0],    	 	 	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with a hold code, but not on the pending project.</b><br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}." (".$row->{'hold'}.")<br>";
    };
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.hold~isnonblank&query.Id/activeAssignments/NumPendingAssignments~eq=0"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}


#we find protocols nearing the animal limit
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -queryName => 'protocolTotalAnimalsBySpecies',
    -columns=>'protocol,allowed,PercentUsed,TotalRemaining,Species,protocol/inves',
    -filterArray => [
        ['TotalRemaining', 'lt', '5'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." protocols with fewer than 5 remaining animals.</b><br>";
	
	$email_html .= "<table border=1><tr><td>Protocol</td><td>PI</td><td>Species</td><td># Allowed</td><td># Remaining</td><td>% Used</td></tr>";
	foreach my $rec (@{$results->{rows}}){			
		$email_html .= "<tr><td>".$$rec{protocol}."</td><td>".$$rec{'protocol/inves'}."</td><td>".$$rec{'Species'}."</td><td>".$$rec{'allowed'}."</td><td>".$$rec{'TotalRemaining'}."</td><td>".$$rec{'PercentUsed'}."</td></tr>";										  
	}				
	$email_html .= "</table><p>\n";	  	    	
	
	
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies&query.TotalRemaining~lt=5'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";	
}

#we find protocols nearing the animal limit
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -queryName => 'protocolTotalAnimalsBySpecies',
    -columns=>'protocol,allowed,PercentUsed,TotalRemaining,Species,protocol/inves',    
    -filterArray => [
        ['PercentUsed', 'gte', '95'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." protocols with fewer than 5% of their animals remaining.</b><br>";

	$email_html .= "<table border=1><tr><td>Protocol</td><td>PI</td><td>Species</td><td># Allowed</td><td># Remaining</td><td>% Used</td></tr>";
	foreach my $rec (@{$results->{rows}}){			
		$email_html .= "<tr><td>".$$rec{protocol}."</td><td>".$$rec{'protocol/inves'}."</td><td>".$$rec{'Species'}."</td><td>".$$rec{'allowed'}."</td><td>".$$rec{'TotalRemaining'}."</td><td>".$$rec{'PercentUsed'}."</td></tr>";										  
	}				
	$email_html .= "</table><p>\n";	  	    	

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies&query.PercentUsed~gte=95'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";	
}




#open(HTML, ">", "C:\\Users\\Admin\\Desktop\\test.html");
#print HTML $email_html;
#close HTML;
#die;

$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -requiredVersion => 8.3,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -queryName => 'NotificationRecipientsExpanded',
    -filterArray => [
		['notificationtype', 'in', $notificationtypes],
    ],
    #-debug => 1,
);	
if(@{$results->{rows}}){	
	my @email_recipients;
	foreach my $row (@{$results->{rows}}){
    	push(@email_recipients, $$row{email})		
    }
	
	if(@email_recipients){
		#print (@email_recipients);die;
		@email_recipients = uniq @email_recipients;
		my $smtp = MIME::Lite->new(
		          To      =>join(", ", @email_recipients),
		          From    =>$from,
		          Subject =>"Subject: Daily Colony Management Alerts: $datestr",
		          Type    =>'multipart/alternative'
		          );
		$smtp->attach(Type => 'text/html',
		          Encoding => 'quoted-printable',
		          Data	 => $email_html
		);         
		$smtp->send() || die;
	}
}

touch(File::Spec->catfile(dirname(abs_path($0)), '.colonyMgmtAlertsLastRun'));
