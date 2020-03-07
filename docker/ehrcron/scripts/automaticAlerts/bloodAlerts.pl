#!/usr/bin/env perl

=head1 DESCRIPTION

This script is designed to run as a cron job.  It will query a number of tables and email a report.
The report is designed to identify potential problems related to blood draws.


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

my $notificationtypes = 'Blood Alerts';
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
my $timestr = sprintf("%02d:%02d", $tm->hour, $tm->min); 

my $email_html = "This email contains any scheduled blood draws not marked as completed.  It was run on: $datetimestr.<p>";
my $results;


#we find any current or future blood draws where the animal is not alive
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Blood Draws',
    -filterArray => [
    	['Id/DataSet/Demographics/calculated_status', 'neqornull', 'Alive'],
    	['qcstate/label', 'neq', 'Request: Denied'],
		['date', 'dategte', $datestr],    			    	
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." current or scheduled blood draws for animals not currently at WNPRC.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Blood Draws&query.date~dategte=$datestr&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}

#we find any blood draws over the allowable limit
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'DailyOverDraws',
#    -filterArray => [
#    	['Id/DataSet/Demographics/calculated_status', 'eq', 'Alive'],
#    	['qcstate/label', 'neq', 'Request: Denied'],
#		['date', 'dategte', $datestr],
#		['BloodRemaining/AvailBlood', 'lt', 0],
#    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." scheduled blood draws exceeding the allowable volume.</b><br>";
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=DailyOverDraws&query.viewName=Blood Summary&query.date~dategte=$datestr&query.Id/Dataset/Demographics/calculated_status~eq=Alive"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";
}
else {
	$email_html .= "<b>There are no future blood draws exceeding the allowable amount based on current weights.</b><br>";
	$email_html .= "<hr>\n";
}

#$email_html .= "<br>\n";
#$email_html .= "<p><a href='https://ehr.primate.wisc.edu/query/WNPRC/EHR/executeQuery.view?schemaName=study&query.queryName=DailyOverDraws'>
#Click here to see animals with less than 10ml of blood available.</a><br>\n";
#$email_html .= "<hr>\n";

#we find any blood draws over the allowable limit
#$results = LabKey::Query::selectRows(
#    -baseUrl => $baseUrl,
#    -containerPath => $studyContainer,
#    -schemaName => 'study',
#    -queryName => 'Blood Draws',
#    -filterArray => [
#    	['Id/DataSet/Demographics/calculated_status', 'neqornull', 'Alive'],
#    	['qcstate/label', 'neq', 'Request: Denied'],
#		['date', 'dategte', $datestr],
#		['BloodRemaining/AvailBlood', 'lt', 0],
#    ],
#    -requiredVersion => 8.3,
#    #-debug => 1,
#);
#
#if(@{$results->{rows}}){
#	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." scheduled blood draws exceeding the allowable volume.</b><br>";
#    foreach my $row (@{$results->{rows}}){
#        $email_html .= $row->{'Id'}."<br>";
#    };
#
#	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Blood Draws&query.viewName=Blood Summary&query.date~dategte=$datestr&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive&query.BloodRemaining/AvailBlood~lt=0"."'>Click here to view them</a><br>\n";
#	$email_html .= "<hr>\n";
#}

#we find any blood draws where the animal is not assigned to that project
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'BloodSchedule',
    -filterArray => [
    	['Id/DataSet/Demographics/calculated_status', 'eq', 'Alive'],
    	['qcstate/label', 'neq', 'Request: Denied'],
		['projectStatus', 'isnonblank', ''],
		['date', 'dategte', $datestr],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." blood draws scheduled today or in the future where the animal is not assigned to the project.</b><br>";
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };

	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=BloodSchedule&query.projectStatus~isnonblank&query.Id/DataSet/Demographics/calculated_status~eq=Alive&query.date~dategte=$datestr"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";
}
else {
	$email_html .= "<b>All blood draws today and in the future have a valid project for the animal.</b><br>";
	$email_html .= "<hr>\n";
}

#we find any blood draws where the animal is not assigned to that project
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'BloodSchedule',
    -filterArray => [    	
    	['Id/DataSet/Demographics/calculated_status', 'eq', 'Alive'],
    	['qcstate/label', 'neq', 'Request: Denied'],
		['projectStatus', 'isnonblank', ''],
		['date', 'dateeq', $datestr],		
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." blood draws scheduled today where the animal is not assigned to the project. DO NOT DRAW FROM THESE ANIMALS UNTIL FIXED.</b><br>";
    foreach my $row (@{$results->{rows}}){
        $email_html .= $row->{'Id'}."<br>";
    };
	
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=BloodSchedule&query.projectStatus~isnonblank&query.Id/DataSet/Demographics/calculated_status~eq=Alive&query.date~dateeq=$datestr"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";			
}	


#we find any blood draws not yet approved
#$results = LabKey::Query::selectRows(
#    -baseUrl => $baseUrl,
#    -containerPath => $studyContainer,
#    -schemaName => 'study',
#    -queryName => 'Blood Draws',
#    -filterArray => [
#    	['Id/DataSet/Demographics/calculated_status', 'eq', 'Alive'],
#		['qcstate/label', 'eq', 'Request: Pending'],
#		['date', 'dategte', $datestr],
#    ],
#    -requiredVersion => 8.3,
#    #-debug => 1,
#);
#
#if(@{$results->{rows}}){
#	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." blood draws requested that have not been approved or denied yet.</b><br>";
#	$email_html .= "<p><a href='".$baseUrl."ehr/".$studyContainer."dataEntry.view#topTab:Requests&activeReport:BloodDrawRequests"."'>Click here to view them</a><br>\n";
#	$email_html .= "<hr>\n";
#}

#we find any blood draws not yet assigned to either SPI or animal care
#$results = LabKey::Query::selectRows(
#    -baseUrl => $baseUrl,
#    -containerPath => $studyContainer,
#    -schemaName => 'study',
#    -queryName => 'Blood Draws',
#    -filterArray => [
#    	['Id/DataSet/Demographics/calculated_status', 'eq', 'Alive'],
#    	['qcstate/label', 'neq', 'Request: Denied'],
#		['billedby', 'isblank', ''],
#		['date', 'dategte', $datestr],
#    ],
#    -requiredVersion => 8.3,
#    #-debug => 1,
#);
#
#if(@{$results->{rows}}){
#	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." blood draws requested that have not been assigned to SPI or Animal Care.</b><br>";
#	$email_html .= "<p><a href='".$baseUrl."ehr/".$studyContainer."dataEntry.view#topTab:Requests&activeReport:BloodDrawRequests'>Click here to view them</a><br>\n";
#	$email_html .= "<hr>\n";
#}

#we find any incomplete blood draws scheduled today, by area
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'BloodSchedule',
    -columns => 'drawStatus,daterequested,project,date,project/protocol,taskid,projectStatus,tube_vol,tube_type,billedby,billedby/title,num_tubes,Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,additionalServices,remark,Id,quantity,qcstate,qcstate/Label,requestid',
    -filterArray => [
    	['Id/DataSet/Demographics/calculated_status', 'eq', 'Alive'],
		['date', 'dateeq', $datestr],
		['qcstate', 'ne', 'Completed'],     			    	
    ],    
    -sort => 'daterequested',
    -requiredVersion => 8.3,
    #-debug => 1,
);


if(!@{$results->{rows}}){
	$email_html .= "There are no blood draws scheduled for $datestr. <hr>";	
}
else {
	my $complete = 0;
	my $incomplete = 0;
	my $summary = {};
	my $counts = {};
    foreach my $row (@{$results->{rows}}){   	    	
		if($row->{'qcstate/Label'} && $row->{'qcstate/Label'} eq 'Completed'){
			$complete++;
		}   
		else {
			if(!$$summary{$row->{'Id/curLocation/area'}}){
				$$summary{$row->{'Id/curLocation/area'}} = {};
				$$counts{$row->{'Id/curLocation/area'}} = {};					
			}	
			if(!$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}}){
				$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}} = {complete=>0,incomplete=>0,incompleteRecords=>[]};				
			}	
						
			if(!$$counts{$row->{'Id/curLocation/area'}}{$row->{'billedby/title'} || 'Not Assigned'}){
				$$counts{$row->{'Id/curLocation/area'}}{$row->{'billedby/title'} || 'Not Assigned'} = 0;				
			}
			$$counts{$row->{'Id/curLocation/area'}}{$row->{'billedby/title'} || 'Not Assigned'}++;
			
			$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}}{incomplete}++;
			push(@{$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}}{incompleteRecords}}, $row);
			
			$incomplete++;				
		}     
    };

	my $url = "<a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=BloodSchedule&query.date~dateeq=$datestr&query.Id/DataSet/Demographics/calculated_status~eq=Alive"."'>Click here to view them</a></p>\n";
	$email_html .= "There are ".@{$results->{rows}}." scheduled blood draws for $datestr.  $complete have been completed.  $url<p>\n";		

		if(!$incomplete){
			$email_html .= "All scheduled blood draws have been marked complete as of $datetimestr.<p>\n";		
		}
		else {
			$email_html .= "The following blood draws have not been marked complete as of $datetimestr:<p>\n";

			$email_html .= "<b>Totals by Area:</b><br>\n";
			
			foreach my $area (sort(keys %$counts)){
				my $types = $$counts{$area};
				$email_html .= $area.":<br>\n";
				foreach my $type (sort(keys %$types)){
					$email_html .= "$type: ".$$types{$type}."<br>\n";						
				}							
			}
			
			$email_html .= "<p>\n";
			$email_html .= "<b>Individual Draws:</b><p>\n";
				
			my $prevRoom = '';
			foreach my $area (sort(keys %$summary)){
				my $rooms = $$summary{$area};			
				$email_html .= "<b>$area:</b><br>\n";
				foreach my $room (sort(keys %$rooms)){
					if($$rooms{$room}{incomplete}){
						$email_html .= "$room: ".$$rooms{$room}{incomplete}."<br>\n";
						$email_html .= "<table border=1><tr><td>Time Requested</td><td>Id</td><td>Tube Vol</td><td>Tube Type</td><td># Tubes</td><td>Total Quantity</td><td>Additional Services</td><td>Assigned To</td></tr>\n";
						
						foreach my $rec (@{$$rooms{$room}{incompleteRecords}}){
							$$rec{daterequested} =~ m/([0-9]{2}):([0-9]{2}):[0-9]{2}/;														
						
							my $color;
							if($tm->hour >= int($1) || ($tm->hour == int($1) && ($tm->min + 15) >= int($2))){
								$color = 'yellow';
							}
							
							$email_html .= "<tr><td".($color ? " style='background:$color;'" : "").">".$$rec{daterequested}."</td><td>".$$rec{Id}."</td><td>".($$rec{tube_vol} ? $$rec{tube_vol}.' mL' : '')."</td><td>".($$rec{tube_type} ? $$rec{tube_type} : '')."</td><td>".($$rec{num_tubes} ? $$rec{num_tubes} : '')."</td><td>".($$rec{quantity} ? $$rec{quantity}.' mL' : '')."</td><td>".($$rec{additionalServices} ? $$rec{additionalServices} : '')."</td><td>".($$rec{"billedby/title"} ? $$rec{"billedby/title"} : '')."</td></tr>\n";
						}
						
						$email_html .= "</table><p>\n";	    	
					}

				}
				$email_html .= "<p>\n";	
			}
		}	
	
	$email_html .= "<hr>\n";	
}	



#open(HTML, ">", "C:\\Users\\Admin\\Desktop\\test.html");
#print HTML $email_html;
#close HTML;

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
		          Subject =>"Subject: Daily Blood Draw Alerts: $datestr",
		          Type    =>'multipart/alternative'
		          );
		$smtp->attach(Type => 'text/html',
		          Encoding => 'quoted-printable',
		          Data	 => $email_html
		);         
		$smtp->send() || die;
	}
}

touch(File::Spec->catfile(dirname(abs_path($0)), '.bloodAlertsLastRun'));
