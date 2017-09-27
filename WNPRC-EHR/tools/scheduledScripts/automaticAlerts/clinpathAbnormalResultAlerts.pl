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

my $studyContainer = 'WNPRC/EHR/';

my $notificationtypes = 'Clinpath Abnormal Results';
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

my $email_html = "This email contains abnormal clinpath results entered since: $datetimestr.<p>";
my $results;
my $doSend = 0;

#touch a file when complete for monit
my $file = File::Spec->catfile(dirname(abs_path($0)), '.clinpathAbnormalResultAlertsLastRun');
if(!-e $file){
	touch($file);
}
my $lastRun = localtime(stat($file)->mtime);
$lastRun = sprintf("%04d-%02d-%02d %02d:%02d", $lastRun->year+1900, ($lastRun->mon)+1, $lastRun->mday, $lastRun->hour, $lastRun->min);

#we find any record requested since the last email
$results = Labkey::Query::selectRows(
    -baseUrl => $baseUrl,
    -requiredVersion => 8.3,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'ClinpathRefRange',
    #-viewName => 'Abnormal',
    -columns => 'Id,date,Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,alertStatus,taskid/datecompleted,testid,result,units,status,ref_range_min,ref_range_max,ageAtTime',
    -filterArray => [
		['qcstate/PublicData', 'eq', 'true'],
		['taskid/datecompleted', 'gte', $lastRun],
		['taskid/datecompleted', 'nonblank', ''],
		#['alertStatus', 'eq', 'true'],
    ],
    #-debug => 1,
);

my $summary = {};

if(@{$results->{rows}}){
    foreach my $row (@{$results->{rows}}){ 	
    	if($row->{alertStatus}){   
	    	$doSend = 1;	
	    		    	
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
    	}							     
    };
    				
}
	
$email_html .= "There have been ".@{$results->{rows}}." abnormal results since $lastRun. <br>";
$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=ClinpathRefRange&query.taskid/datecompleted~gte=".$lastRun."&&query.taskid/datecompleted~nonblank&query.qcstate/PublicData~eq=true"."'>Click here to view them</a><p>\n";	
	
my $prevRoom = '';
foreach my $area (sort(keys %$summary)){
	my $rooms = $$summary{$area};			
	$email_html .= "<b>$area:</b><br>\n";
	foreach my $room (sort(keys %$rooms)){
		$email_html .= "$room:<br>\n";
		$email_html .= "<table border=1><tr><td>Id</td><td>Collect Date</td><td>Date Completed</td><td>Test Id</td><td>Result</td><td>Units</td><td>Status</td><td>Ref Range Min</td><td>Ref Range Max</td><td>Age At Time</td></tr>";
	
		foreach my $rec (@{$$rooms{$room}}){
				
			my $color;
			if($$rec{'ref_range_min'} && $$rec{'result'} < $$rec{'ref_range_min'}){
				$color = '#FBEC5D';
			}
			elsif ($$rec{'result'} > $$rec{'ref_range_max'}) {
				$color = '#E3170D';	
			}
			
			$email_html .= "<tr><td><a href='".$baseUrl."ehr/".$studyContainer."animalHistory.view?#_inputType:renderSingleSubject&_showReport:1&subject:".$$rec{Id}."&combineSubj:true&activeReport:clinPathRuns'>".$$rec{Id}."</a></td>".
			"<td>".$$rec{date}."</td>".		
			"<td>".$$rec{'taskid/datecompleted'}."</td>".						
			"<td>".$$rec{testId}."</td>".
			"<td>".($$rec{'result'} ? $$rec{'result'} : '')."</td>".
			"<td>".($$rec{'units'} ? $$rec{'units'} : '')."</td>".
			"<td".($color ? " style=background:$color;" : '').">".($$rec{'status'} ? $$rec{'status'} : '')."</td>".				
			"<td>".($$rec{'ref_range_min'} ? $$rec{'ref_range_min'} : '')."</td>".
			"<td>".($$rec{'ref_range_max'} ? $$rec{'ref_range_max'} : '')."</td>".
			"<td>".($$rec{'AgeAtTime'} ? $$rec{'AgeAtTime'} : '')."</td>".
			"</tr>";						
		}
						
		$email_html .= "</table><p>\n";	    	
	}
	$email_html .= "<p>";	
}
    	
$email_html .= "<hr>\n";	



#open(HTML, ">", "C:\\Users\\Admin\\Desktop\\test.html");
#print HTML $email_html;
#close HTML;
#die;

if($doSend){
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
			@email_recipients = uniq @email_recipients;

			my $smtp = MIME::Lite->new(
			          To      =>join(", ", @email_recipients),
			          From    =>$from,
			          Subject =>"Subject: Abnormal Clinpath Results: $datetimestr",
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

touch($file);
