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

my $notificationtypes = 'Colony Alerts';
my $mail_server = $ENV{'MAIL_SERVER'};

#emails will be sent from this address
my $from = 'ehr-do-not-reply@primate.wisc.edu';


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
    -sort => 'Id',
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
    -sort => 'Id',
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


#then we find all living animals with multiple active housing records:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'housingProblems',
    -sort => 'Id',
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with multiple active housing records:</b><br>";
	
	my @ids;
    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=housingProblems"."'>Click here to view these animals</a></p>\n";
    $email_html .= "<a href='".$baseUrl."ehr/".$studyContainer."updateQuery.view?schemaName=study&query.queryName=Housing&query.Id~in=".join(';', @ids)."&query.enddate~isblank'>Click here to edit housing to fix the problems</a><p>";
    $email_html .= '<hr>';
}

#then we find all living animals with multiple active housing records:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'ValidateHousingSnapshot',
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals where the housing snapshot doesnt match the housing table.  The snapshot has been automatically refreshed:</b><br>";	
    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=ValidateHousingSnapshot"."'>Click here to view the report again</a></p>\n";
    $email_html .= '<hr>';
    
    system("/usr/local/labkey/tools/updateSnapshot.pl");
}

#then we find all records with potential housing condition problems
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'housingConditionProblems',
    -sort => 'Id',
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

#we find open housing records where the animal is not alive
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Housing',
    -sort => 'Id',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],    			    	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." active housing records where the animal is not alive:</b><br>";
	
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };
    	
	#$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." housing records for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Housing&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}

#we find living animals without an active housing record
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -sort => 'Id',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'eq', 'Alive'],
    	['Id/curLocation/room/room', 'isblank', ''],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." living animals without an active housing record:</b><br>";
		
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };
    	
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.Id/curLocation/room~isblank&query.Id/Dataset/Demographics/calculated_status~eq=Alive"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}


#then we find all records with problems in the calculated_status field
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Validate_status',
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with problems in the status field:</b><br>";
	
	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Validate_status'>Click here to view these records</a></p>\n";
    $email_html .= "When you see these problems, it usually happens because the automatic process of calculating this field, which is triggered by births, deaths, departures or arrivals, didnt work right.  To force it to re-calculate, just edit the animal's record on one of these tables, maybe no changes, then hit submit.  That should force a re-calculation of the status field.<p>";
    $email_html .= "<hr>";
}

#NOTE: depreciated
##then we find all records with problems in the calculated_status field
#$results = LabKey::Query::selectRows(
#    -baseUrl => $baseUrl,
#    -containerPath => $studyContainer,
#    -schemaName => 'study',
#    -queryName => 'Validate_status_mysql',
#    -requiredVersion => 8.3,
#    #-debug => 1,
#);
#
#if(@{$results->{rows}}){
#	my @ids;
#
#    foreach my $row (@{$results->{rows}}){
#    	push(@ids, $row->{'id'});
#        $email_html .= $row->{'id'}."<br>";
#    };
#
#	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with potential problems in the status field (based on old system).</b><br>";
#    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Validate_status_mysql'>Click here to view these records</a></p>\n";
#    $email_html .= "When you see these problems, it usually happens because the automatic process of calculating this field, which is triggered by births, deaths, departures or arrivals, didnt work right.  To force it to re-calculate, just edit the animal's record on one of these tables, maybe no changes, then hit submit.  That should force a re-calculation of the status field.<p>";
#    $email_html .= "<hr>";
#}

#then we find all animals lacking any assignments
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -viewName => 'No Active Assigns',
    -sort => 'Id',
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
		['project/protocol', 'isblank', ''],    			    	
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


#then we find all living siv+ animals not exempt from pair housing (20060202)
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -filterArray => [
    	['calculated_status', 'eq', 'Alive'],
		['medical', 'contains', 'siv'],
		['Id/assignmentSummary/ActiveVetAssignments', 'doesnotcontain', '20060202'],    			    	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with SIV in the medical field, but not actively assigned to exempt from paired housing (20060202):</b><br>";	
    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Alive%2C%20at%20WNPRC&query.medical~contains=siv&query.Id%2FassignmentSummary%2FActiveVetAssignments~doesnotcontain=20060202"."'>Click here to view them</a></p>\n";
    $email_html .= '<hr>';
}

#then we find all living shiv+ animals not exempt from pair housing (20060202)
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -filterArray => [
    	['calculated_status', 'eq', 'Alive'],
		['medical', 'contains', 'shiv'],
		['Id/assignmentSummary/ActiveVetAssignments', 'doesnotcontain', '20060202'],    			    	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with SHIV in the medical field, but not actively assigned to exempt from paired housing (20060202):</b><br>";	
    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Alive%2C%20at%20WNPRC&query.medical~contains=shiv&query.Id%2FassignmentSummary%2FActiveVetAssignments~doesnotcontain=20060202"."'>Click here to view them</a></p>\n";
    $email_html .= '<hr>';
}

#we find open ended treatments where the animal is not alive
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Treatment Orders',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],    			    	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." active treatments for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Treatment Orders&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}	


#we find open ended problems where the animal is not alive
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Problem List',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],    			    	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." unresolved problems for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Problem List&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}	


#we find open assignments where the animal is not alive
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

#we find non-continguous housing records
my $paramVal=sprintf("%02d/%02d/%04d", ($tm->mon)+1, $tm->mday, $tm->year+1900-1);

$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'HousingCheck',
    -parameters => [
    	['MINDATE', $paramVal]
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." housing records since $paramVal that do not have a contiguous previous or next record.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=HousingCheck&query.param.MINDATE=$paramVal"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}	

#we find birth records in the past 90 days missing a gender
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Birth',
    -filterArray => [
        ['gender', 'isblank', ''],
        ['date', 'dategte', '-90d'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: The following birth records were entered in the last 90 days, but are missing a gender:</b><br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}.' ('.$row->{'date'}.")<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Birth&query.gender~isblank=&query.date~dategte=-90d"."'>Click here to view these animals</a></p>\n";
    $email_html .= '<hr>';
}

#we find demographics records in the past 90 days missing a gender
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -sort => 'Id',
    -filterArray => [
        ['gender', 'isblank', ''],
        ['created', 'dategte', '-90d'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: The following demographics records were entered in the last 90 days, but are missing a gender:</b><br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}.($row->{'birth'} ? ' ('.$row->{'birth'}.')' : '')."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.gender~isblank=&query.created~dategte=-90d"."'>Click here to view these animals</a></p>\n";
    $email_html .= '<hr>';
}

#we find prenatal records in the past 90 days missing a gender
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Prenatal Deaths',
    -sort => 'Id',
    -filterArray => [
        ['gender', 'isblank', ''],
        ['date', 'dategte', '-90d'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: The following prenatal death records were entered in the last 90 days, but are missing a gender:</b><br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}.' ('.$row->{'date'}.")<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Prenatal Deaths&query.gender~isblank=&query.date~dategte=-90d"."'>Click here to view these animals</a></p>\n";
    $email_html .= '<hr>';
}

#we find prenatal records in the past 90 days missing species
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Prenatal Deaths',
    -sort => 'Id',
    -filterArray => [
        ['species', 'isblank', ''],
        ['date', 'dategte', '-90d'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: The following prenatal death records were entered in the last 90 days, but are missing the species:</b><br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}.' ('.$row->{'date'}.")<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Prenatal Deaths&query.species~isblank=&query.date~dategte=-90d"."'>Click here to view these animals</a></p>\n";
    $email_html .= '<hr>';
}


#we find all animals that died in the past 90 days where there isnt a weight within 7 days of death:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -sort => 'Id',
    -queryName => 'validateFinalWeights',
    -filterArray => [
        ['death', 'dategte', '-90d'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals that are dead, but do not have a weight within the previous 7 days:</b><br>";

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=validateFinalWeights&query.death~dategte=-90d"."'>Click here to view them</a></p>\n";
    $email_html .= '<hr>';
}

#we find TB records lacking a results more than 30 days old, but less than 90
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'TB Tests',
    -filterArray => [
        ['missingresults', 'eq', 'true'],
        ['date', 'dategte', '-90d'],
        ['date', 'datelte', '-10d'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." TB Tests in the past 10-90 days that are missing results.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=TB Tests&query.date~datelte=-10d&query.date~dategte=-90d&query.missingresults~eq=true"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";	
}



#we find protocols nearing the animal limit
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -queryName => 'protocolTotalAnimalsBySpecies',
    -filterArray => [
        ['TotalRemaining', 'lt', '5'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." protocols with fewer than 5 remaining animals.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies&query.TotalRemaining~lt=5'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";	
}

#we find protocols nearing the animal limit
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -queryName => 'protocolTotalAnimalsBySpecies',
    -filterArray => [
        ['PercentUsed', 'gte', '95'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." protocols with fewer than 5% of their animals remaining.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies&query.PercentUsed~gte=95'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";	
}

#we find protocols expiring soon
my $days = 14;
my $day_value = (365 * 3 - $days);
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -queryName => 'protocol',
    -filterArray => [
        ['Approve', 'datelte', '-' . $day_value . 'd'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." protocols that will expire within the next $days days.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr&query.queryName=protocol&query.Approve~datelte=-${day_value}d'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";
}

#we find birth records without a corresponding demographics record
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Birth',
    -sort => 'Id',
    -filterArray => [
    	['Id/Dataset/Demographics/Id', 'isblank', '']	 	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." WNPRC birth records without a corresponding demographics record.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Birth&query.Id/Dataset/Demographics/Id~isblank"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}

#we find death records without a corresponding demographics record
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Deaths',
    -sort => 'Id',
    -filterArray => [
    	['Id/Dataset/Demographics/Id', 'isblank', ''],
    	['notAtCenter', 'neqornull', 'true'] 	 	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." WNPRC death records without a corresponding demographics record.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Deaths&query.Id/Dataset/Demographics/Id~isblank&query.notAtCenter~neqornull=true"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}

#we find animals with hold codes, but not on pending 
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',   
    -sort => 'Id', 
    -filterArray => [
    	['hold', 'isnonblank', ''],
		['Id/assignmentSummary/NumPendingAssignments', 'eq', 0],    	 	 	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with a hold code, but not on the pending project.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.hold~isnonblank&query.Id/assignmentSummary/NumPendingAssignments~eq=0"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}

#we find assignments with projected releases today 
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Assignment',    
    -sort => 'Id',
    -filterArray => [
    	['projectedRelease', 'dateeq', $datestr],
    	['enddate', 'isnonblank', ''],    	 	 	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>ALERT: There are ".@{$results->{rows}}." assignments with a projected release date for today that have not already been ended.</b><br>";

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Assignment&query.projectedRelease~dateeq=$datestr&query.enddate~isnonblank="."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}


#we find assignments with projected releases tomorrow 
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Assignment',    
    -filterArray => [
    	['projectedRelease', 'dateeq', $tomorrow],    	 	 	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>ALERT: There are ".@{$results->{rows}}." assignments with a projected release date for tomorrow.</b><br>";

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Assignment&query.projectedRelease~dateeq=$tomorrow"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}


#summarize events in last 5 days:
my $mindate = localtime( ( time() - ( 5 * 24 * 60 * 60 ) ) );
$mindate = sprintf("%04d-%02d-%02d", $mindate->year+1900, ($mindate->mon)+1, $mindate->mday);
$email_html .= "<b>Colony events in the past 5 days:</b><p>";


#births in the last 5 days:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Birth',
    -sort => 'Id',
    -filterArray => [
    	['date', 'dategte', $mindate] 	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "Births since $mindate:<br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Birth&query.date~dategte=$mindate"."'>Click here to view them</a><p>\n";
#    $email_html .= '<hr>';
}


#deaths in the last 5 days:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Deaths',
    -sort => 'Id',
    -filterArray => [
    	['date', 'dategte', $mindate] 	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "Deaths since $mindate:<br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Deaths&query.date~dategte=$mindate"."'>Click here to view them</a><p>\n";
    #$email_html .= '<hr>';
}

#prenatal deaths in the last 5 days:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Prenatal Deaths',
    -sort => 'Id',
    -filterArray => [
    	['date', 'dategte', $mindate]
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "Prenatal Deaths since $mindate:<br>";

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Prenatal Deaths&query.date~dategte=$mindate"."'>Click here to view them</a><p>\n";
    #$email_html .= '<hr>';
}

$email_html .= '<hr>';



#find the total finalized records with future dates 
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'StudyData',
    -filterArray => [
        ['qcstate/PublicData', 'eq', 'true'],
        ['date', 'dategt', $datestr],
        ['dataset/label', 'neq', 'Treatment Orders'],
        ['dataset/label', 'neq', 'Assignment'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." finalized records with future dates.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=StudyData&query.date~dategt=$datestr&query.qcstate/PublicData~eq=1&query.dataset/label~neq=Treatment Orders&query.dataset/label~neq=Assignment'>Click here to view them</a><br>\n";
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
		          Subject =>"Subject: Daily Colony Alerts: $datestr",
		          Type    =>'multipart/alternative'
		          );
		$smtp->attach(Type => 'text/html',
		          Encoding => 'quoted-printable',
		          Data	 => $email_html
		);         
		$smtp->send() || die;
	}
}

touch(File::Spec->catfile(dirname(abs_path($0)), '.colonyAlertsLastRun'));
