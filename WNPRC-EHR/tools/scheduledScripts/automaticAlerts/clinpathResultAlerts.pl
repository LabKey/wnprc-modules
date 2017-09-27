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
#$baseUrl = 'http://localhost:8080/labkey/';

my $studyContainer = 'WNPRC/EHR/';

my $notificationtypes = 'Clinpath Results';
my $mail_server = $ENV{'MAIL_SERVER'};

#emails will be sent from this address
my $from = 'ehr-no-not-reply@primate.wisc.edu';


############Do not edit below this line
use strict;
use warnings;
use Labkey::Query;
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

my $yesterday = localtime( ( time() - ( 24 * 60 * 60 ) ) );
$yesterday = sprintf("%04d-%02d-%02d", $yesterday->year+1900, ($yesterday->mon)+1, $yesterday->mday);


my $email_html = "This email contains clinpath results entered since: $yesterday.<p>";
my $results;



#we find any record requested since the last email
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Clinpath Runs',
    -columns => 'Id,date,Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,serviceRequested,requestId,requestid/description,reviewedBy,dateReviewed',
    -sort => 'Id,date',
    -filterArray => [
		['qcstate/PublicData', 'eq', 'true'],
		['taskid/datecompleted', 'dategte', $yesterday],
		['taskid/datecompleted', 'nonblank', ''],
		#['dateReviewed', 'isblank', ''],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){	
	$email_html .= "There are ".@{$results->{rows}}." completed requests since $yesterday. Below is a summary.  Click the animal ID for more detail.  <br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Clinpath Runs&query.viewName=Plus Room&query.taskid/datecompleted~dategte=".$yesterday."&&query.taskid/datecompleted~nonblank"."'>Click here to view them</a><p>\n";	
	
	my $summary = {};
    foreach my $row (@{$results->{rows}}){
	  	if(!$row->{'Id/curLocation/area'}){
	  		$row->{'Id/curLocation/area'} = 'No Active Housing';
	  	}
	  	if(!$row->{'Id/curLocation/room'}){
	  		$row->{'Id/curLocation/room'} = 'No Room';
	  	}
	  		  	
		if(!$$summary{$row->{'Id/curLocation/area'}}){
			$$summary{$row->{'Id/curLocation/area'}} = {};				
		}	
		if(!$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}}){
			$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}} = [];				
		}	
			
		if($$row{'requestid/description'}){
			$$row{'requestid/description'} =~ s/\n/\<br\>/g;
		}
		push(@{$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}}}, $row);									     
    };
    
	my $prevRoom = '';
	foreach my $area (sort(keys %$summary)){
		my $rooms = $$summary{$area};			
		$email_html .= "<b>$area:</b><br>\n";
		foreach my $room (sort(keys %$rooms)){
			$email_html .= "$room:<br>\n";
			$email_html .= "<table border=1><tr><td>Id</td><td>Collect Date</td><td>Service Requested</td><td>Requestor</td><td>Date Reviewed</td><td>Reviewed By</td></tr>";
			foreach my $rec (@{$$rooms{$room}}){		
				$email_html .= "<tr><td><a href='".$baseUrl."ehr/".$studyContainer."animalHistory.view?#_inputType:renderSingleSubject&_showReport:1&subject:".$$rec{Id}."&combineSubj:true&activeReport:clinPathRuns'>".$$rec{Id}."</a></td><td>".$$rec{date}."</td><td>".$$rec{'serviceRequested'}."</td><td>".($$rec{'requestid/description'} ? $$rec{'requestid/description'} : '')."</td><td>".($$rec{'dateReviewed'} ? $$rec{'dateReviewed'} : '')."</td><td".($$rec{'reviewedBy'} ? '' : ' style=background:red;').">".($$rec{'reviewedBy'} ? $$rec{'reviewedBy'} : '')."</td></tr>";
			}
						
			$email_html .= "</table><p>\n";	    	
		}
		$email_html .= "<p>";	
	}
    	
	$email_html .= "<hr>\n";				
}
else {
	$email_html .= "No requests have been completed.<br>";
	$email_html .= "<hr>\n";
}




#open(HTML, ">", "C:\\Users\\Admin\\Desktop\\test.html");
#print HTML $email_html;
#close HTML;
#die;

$results = Labkey::Query::selectRows(
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
		          Subject =>"Subject: New Clinpath Results: $datetimestr",
		          Type    =>'multipart/alternative'
		          );
		$smtp->attach(Type => 'text/html',
		          Encoding => 'quoted-printable',
		          Data	 => $email_html
		);         
		$smtp->send() || die;
	}
}


touch(File::Spec->catfile(dirname(abs_path($0)), '.clinpathResultAlertsLastRun'));
