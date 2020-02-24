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

my $notificationtypes = 'Colony Alerts Lite';
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

my $email_html = "This email contains a series of automatic alerts about the WNPRC colony.  It was run on: $datetimestr.<p>";
my $results;
my $doSend = 0;


#then we find all living animals with multiple active housing records:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'housingProblems',
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
    $doSend = 1;

	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

    $email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with multiple active housing records.</b><br>";
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
	$doSend = 1;
	
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals where the housing snapshot doesnt match the housing table.  The snapshot has been automatically refreshed:</b><br>";	
    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=ValidateHousingSnapshot"."'>Click here to view the report again</a></p>\n";
    $email_html .= '<hr>';
    
    system("/usr/local/labkey/automaticAlerts/updateSnapshot.pl");
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
    $doSend = 1;

	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

    $email_html .= "<b>WARNING: There are ".@{$results->{rows}}." housing records with potential problems in the condition field.</b><br>";
    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=housingConditionProblems&query.viewName=Problems"."'>Click here to view these records</a></p>\n";
    $email_html .= "<a href='".$baseUrl."ehr/".$studyContainer."updateQuery.view?schemaName=study&query.queryName=Housing&query.Id~in=".join(';', @ids)."&query.enddate~isblank'>Click here to edit housing to fix the problems</a><p>";

    #$email_html .= join('<br>', @ids);
    $email_html .= '<hr>';
}

#we find non-continguous housing records
my $paramVal = localtime( ( time() - ( 7 * 24 * 60 * 60 ) ) );
$paramVal=sprintf("%02d/%02d/%04d", ($paramVal->mon)+1, $paramVal->mday, $paramVal->year+1900);

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
	$doSend = 1;
	
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." housing records since $paramVal that do not have a contiguous previous or next record.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=HousingCheck&query.param.MINDATE=$paramVal"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}	


#we find open housing records where the animal is not alive
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Housing',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],    			    	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
    $doSend = 1;

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };
    	
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." housing records for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Housing&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";			
}


#we find living animals without an active housing record
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -filterArray => [
    	['Id/Dataset/Demographics/calculated_status', 'eq', 'Alive'],
    	['Id/curLocation/room/room', 'isblank', ''],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
    $doSend = 1;

    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };
    	
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." living animals that lack an active housing record.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.Id/curLocation/room/room~isblank&query.Id/Dataset/Demographics/calculated_status~eq=Alive"."'>Click here to view them</a><br>\n";#
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
    $doSend = 1;

	my @ids;

    foreach my $row (@{$results->{rows}}){
    	push(@ids, $row->{'id'});
        $email_html .= $row->{'id'}."<br>";
    };

	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with potential problems in the status field.</b><br>";
    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Validate_status'>Click here to view these records</a></p>\n";
    $email_html .= "<a href='".$baseUrl."ehr/".$studyContainer."updateQuery.view?schemaName=study&query.queryName=Demographics&query.Id~in=".join(';', @ids)."'>Click here to edit demographics to fix the problems</a><p>";
    $email_html .= "<hr>";
}

#then we find all records with problems in the calculated_status field
#$results = LabKey::Query::selectRows(
#    -baseUrl => $baseUrl,
#    -containerPath => $studyContainer,
#    -schemaName => 'study',
#    -queryName => 'Validate_status_mysql',
#    -requiredVersion => 8.3,
#    #-debug => 1,
#);

#if(@{$results->{rows}}){
#    $doSend = 1;
#
#	my @ids;
#
#    foreach my $row (@{$results->{rows}}){
#    	push(@ids, $row->{'id'});
#        $email_html .= $row->{'id'}."<br>";
#    };
#
#   $email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals with potential problems in the status field (based on old system).</b><br>";
#    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Validate_status_mysql'>Click here to view these records</a></p>\n";
#    $email_html .= "<a href='".$baseUrl."ehr/".$studyContainer."updateQuery.view?schemaName=study&query.queryName=Demographics&query.Id~in=".join(';', @ids)."'>Click here to edit demographics to fix the problems</a><p>";
#    $email_html .= "<hr>";
#}


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
    $doSend = 1;

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
    $doSend = 1;

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
    $doSend = 1;

	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." animals double assigned to the same project.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=duplicateAssignments"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}




#open(HTML, ">", "C:\\Users\\Admin\\Desktop\\test.html");
#print HTML $email_html;
#close HTML;
#die;

if($doSend){
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
		              Subject =>"Subject: Colony Alerts: $datestr",
		              Type    =>'multipart/alternative'
		              );
		    $smtp->attach(Type => 'text/html',
		              Encoding => 'quoted-printable',
		              Data	 => $email_html
		    );
		    $smtp->send() || die;
		}
	}
}


touch(File::Spec->catfile(dirname(abs_path($0)), '.colonyAlertsLiteLastRun'));
