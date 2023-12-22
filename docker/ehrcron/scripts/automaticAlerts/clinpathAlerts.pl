#!/usr/bin/env perl

=head1 DESCRIPTION

This script is designed to run as a cron job.  It will query a number of tables and email a report.
The report is designed to identify potential problems related to clinpath.


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
my $printableUrl = $ENV{'PERL_LINK_URL'};

my $studyContainer = 'WNPRC/EHR/';
my $notificationtypes = 'Clinpath Admin Alerts';
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
use File::stat;
use File::Touch;
use Cwd 'abs_path';
use File::Basename;
use File::Spec;
use List::MoreUtils qw/ uniq /;

# Find today's date
my $tm = localtime;
my $datetimestr=sprintf("%04d-%02d-%02d at %02d:%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);
my $datestr=sprintf("%04d-%02d-%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday);
my $timestr = sprintf("%02d:%02d", $tm->hour, $tm->min);

my $email_html = "This email contains reports on Clinpath Requests.  It was run on: $datetimestr.<p>";
my $results;


#touch a file when complete for monit
my $file = File::Spec->catfile(dirname(abs_path($0)), '.clinpathAlertsLastRun');
if(!-e $file){
	touch($file);
}
my $lastRun = localtime(stat($file)->mtime);
$lastRun = sprintf("%04d-%02d-%02d %02d:%02d", $lastRun->year+1900, ($lastRun->mon)+1, $lastRun->mday, $lastRun->hour, $lastRun->min); 


#we find any record requested since the last email
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Clinpath Runs',
    -filterArray => [
		['qcstate/label', 'eq', 'Request: Pending'],
		['created', 'gte', $lastRun],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

$email_html .= "<b>Clinpath requests created since the last time this email was sent ($lastRun):</b><br>\n";
if(@{$results->{rows}}){
	$email_html .= "There are ".@{$results->{rows}}." requests.<br>";
	$email_html .= "<p><a href='".$printableUrl."ehr/".$studyContainer."dataEntry.view#topTab:Requests&activeReport:ClinpathRequests"."'>Click here to view them</a><br>\n";	
}
else {
	$email_html .= "No requests have been entered.<br>";
}
$email_html .= "<hr>\n";




#we find any requests not yet approved
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Clinpath Runs',
    -filterArray => [
		['qcstate/label', 'eq', 'Request: Pending'],
		['date', 'dategte', $datestr],		
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

$email_html .= "<b>Clinpath requests that have not been approved or denied yet:</b><br>\n";
if(@{$results->{rows}}){
	$email_html .= "WARNING: There are ".@{$results->{rows}}." requests that have not been approved or denied yet.<br>";
	$email_html .= "<p><a href='".$printableUrl."ehr/".$studyContainer."dataEntry.view#topTab:Requests&activeReport:ClinpathRequests"."'>Click here to view them</a><br>\n";			
}
else {
	$email_html .= "There are no requests that have not been approved or denied yet.<br>";	
}
$email_html .= "<hr>\n";	


#we find any record not completed where the date requested is today
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Clinpath Runs',
    -filterArray => [
		['qcstate/label', 'neq', 'Completed'],
		['date', 'datelte', $datestr],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." requests that were requested for today or earlier, but have not been marked complete.</b><br>";
	$email_html .= "<p><a href='".$printableUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Clinpath Runs&query.qcstate/label~neq=Completed&query.date~datelte=$datestr"."'>Click here to view them</a><br>\n";
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
		          Subject =>"Subject: Daily Clinpath Alerts: $datestr",
		          Type    =>'multipart/alternative'
		          );
		$smtp->attach(Type => 'text/html',
		          Encoding => 'quoted-printable',
		          Data	 => $email_html
		);         
		$smtp->send() || die;
	}
}

touch($file);
