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

my $notificationtypes = 'Overdue Weight Alerts';
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

my $threeDaysAgo = localtime( ( time() - ( 3 * 24 * 60 * 60 ) ) );
$threeDaysAgo = sprintf("%04d-%02d-%02d", $threeDaysAgo->year+1900, ($threeDaysAgo->mon)+1, $threeDaysAgo->mday);


my $email_html = "This email contains alerts of animals not weighed in the past 60 days.  It was run on: $datetimestr.<p>";
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

$email_html .= "<b>Living animals without a weight:</b><br>";

if(!@{$results->{rows}}){
	$email_html .= "There are no living animals without a weight.<hr>";	
}		
else {	
    foreach my $row (@{$results->{rows}}){  	
        $email_html .= $row->{'Id'}."<br>";
    };

    $email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Demographics&query.calculated_status~eq=Alive&query.Id/MostRecentWeight/MostRecentWeightDate~isblank"."'>Click here to view these animals</a></p>";
    $email_html .= '<hr>';
}


#find animals not weighed in the past 60 days
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Demographics',
    -viewName => 'Weight Detail',
    -filterArray => [
    	['calculated_status', 'eq', 'Alive'],
		['Id/MostRecentWeight/DaysSinceWeight', 'gt', 60],    			    	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: The following animals have not been weighed in the past 60 days:</b><br>";
			
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.viewName=Weight Detail&query.queryName=Demographics&query.Id/MostRecentWeight/DaysSinceWeight~gt=60&query.calculated_status~eq=Alive"."'>Click here to view them</a><p>\n";
	
	my $summary = {};
    foreach my $row (@{$results->{rows}}){   
		if(!$$summary{$row->{'Id/curLocation/area'}}){
			$$summary{$row->{'Id/curLocation/area'}} = {};				
		}	
		if(!$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}}){
			$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}} = [];				
		}	
			
		push(@{$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}}}, $row);									     
    };
    
	my $prevRoom = '';
	foreach my $area (sort(keys %$summary)){
		my $rooms = $$summary{$area};			
		$email_html .= "<b>$area:</b><br>\n";
		foreach my $room (sort(keys %$rooms)){
			$email_html .= "$room:<br>\n";
			$email_html .= "<table border=1><tr><td>Cage</td><td>Id</td><td>Days Since Weight</td></tr>";
				
			foreach my $rec (@{$$rooms{$room}}){
				$email_html .= "<tr><td>".$$rec{'Id/curLocation/cage'}."</td><td>".$$rec{Id}."</td><td>".$$rec{'Id/MostRecentWeight/DaysSinceWeight'}."</td></tr>";
			}
						
			$email_html .= "</table><p>\n";	    	
		}
		$email_html .= "<p>";	
	}
    	
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
		          Subject =>"Subject: Overdue Weights: $datestr",
		          Type    =>'multipart/alternative'
		          );
		$smtp->attach(Type => 'text/html',
		          Encoding => 'quoted-printable',
		          Data	 => $email_html
		);         
		$smtp->send() || die;
	}
}

touch(File::Spec->catfile(dirname(abs_path($0)), '.overdueWeightAlertsLastRun'));

