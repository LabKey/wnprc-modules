#!/usr/bin/env perl

=head1 DESCRIPTION

This script is designed to run as a cron job.  It will query a number of tables an email a report.


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

my $notificationtypes = 'Admin Alerts';
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


my $email_html = "This email contains a series of automatic alerts about the WNPRC colony.  It was run on: $datetimestr.<p>";
my $results;


#summarize site usage in the past 7 days
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'core',
    -queryName => 'SiteUsageByDay',
    -filterArray => [
		['date', 'dategte', '-7d'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){	
	$email_html .= "Site Logins In The Past 7 Days:<br>\n";
	$email_html .= "<table border=1><tr><td>Day of Week</td><td>Date</td><td>Logins</td></tr>";

    foreach my $row (@{$results->{rows}}){		
		$email_html .= "<tr><td>".$$row{dayOfWeek}."</td><td>".$$row{date}."</td><td>".$$row{Logins}."</td></tr>";
    }		
	$email_html .= "</table><p>\n";	    				
}

#Client Errors:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => 'shared',
    -schemaName => 'auditlog',
    -queryName => 'audit',
    -viewName => 'EHR Client Errors',
    -filterArray => [
        ['date', 'dategte', $yesterday],
		['key1', 'neq', 'LabKey Server Backup'],                
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There were ".(@{$results->{rows}})." client errors since $yesterday:</b>";

    $email_html .= "<p><a href='".$baseUrl."query/Shared/executeQuery.view?schemaName=auditlog&query.queryName=audit&query.viewName=EHR Client Errors&query.date~dategte=".$yesterday."&key1~neq=LabKey Server Backup'>Click here to them</a></p>\n";
    $email_html .= '<hr>';
}


#we print some stats on data entry:

$email_html .= "<b>Data Entry Stats:</b><p>";

#$results = LabKey::Query::executeSql(
#    -baseUrl => $baseUrl,
#    -containerPath => $studyContainer,
#    -schemaName => 'ehr',
#    -sql => "SELECT formtype, count(*) as total FROM ehr.tasks WHERE cast(created as date) = '$yesterday' GROUP BY formtype ORDER BY formtype",    
#    #-debug => 1,
#);

#if(@{$results->{rows}}){	
#	$email_html .= "Number of Forms Created Yesterday: <br>\n";
#    foreach my $row (@{$results->{rows}}){
#        $email_html .= $row->{'formtype'}.": ".$row->{'total'}."<br>\n";
#    };
	
#	$email_html .= "<p>\n";			
#}

#$results = LabKey::Query::executeSql(
#    -baseUrl => $baseUrl,
#    -containerPath => $studyContainer,
#    -schemaName => 'ehr',
#    -sql => "SELECT Dataset.Label as label, count(*) as total FROM study.studydata WHERE cast(created as date) = '$yesterday' and taskid is not null GROUP BY Dataset.Label ORDER BY Dataset.Label",    
    #-debug => 1,
#);

#if(@{$results->{rows}}){	
#	$email_html .= "Number of Records Created Yesterday Through LabKey: <br>\n";
#    foreach my $row (@{$results->{rows}}){
#        $email_html .= $row->{'label'}.": ".$row->{'total'}."<br>\n";
#    };
	
#	$email_html .= "<p>\n";			
#}

#$results = LabKey::Query::executeSql(
#    -baseUrl => $baseUrl,
#    -containerPath => $studyContainer,
#    -schemaName => 'ehr',
#    -sql => "SELECT DataSet.Label as label, count(*) as total FROM study.studydata WHERE cast(created as date) = '$yesterday' and taskid is null and requestid is null GROUP BY DataSet.Label ORDER BY DataSet.Label",    
#    #-debug => 1,
#);
#
#if(@{$results->{rows}}){	
#	$email_html .= "Number of Records Created Yesterday Through MySQL: <br>\n";
#    foreach my $row (@{$results->{rows}}){
#        $email_html .= $row->{'label'}.": ".$row->{'total'}."<br>\n";
#    };
#	
#	$email_html .= "<p>\n";			
#}





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
		@email_recipients = uniq @email_recipients;

		my $smtp = MIME::Lite->new(
		          To      =>join(", ", @email_recipients),
		          From    =>$from,
		          Subject =>"Subject: Daily Admin Alerts: $datestr",
		          Type    =>'multipart/alternative'
		          );
		$smtp->attach(Type => 'text/html',
		          Encoding => 'quoted-printable',
		          Data	 => $email_html
		);         
		$smtp->send() || die;
	}
}
	

touch(File::Spec->catfile(dirname(abs_path($0)), '.adminAlertsLastRun'));
