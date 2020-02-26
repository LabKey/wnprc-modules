#!/usr/bin/env perl

=head1 DESCRIPTION

This script is designed to run as a cron job.  It will query a number of tables an email a report
summarizing daily treatments and related issues.


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

my $notificationtypes = 'Incomplete Treatments';
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
#use Time::Piece;
use File::Touch;
use File::Spec;
use File::Basename;
use Cwd 'abs_path';
use List::MoreUtils qw/ uniq /;

# this is mostly safe since a lot of times some strings are left blank (from data entry)
no warnings 'uninitialized';

# Find today's date
my $tm = localtime;
my $datetimestr=sprintf("%04d-%02d-%02d at %02d:%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);
my $datestr=sprintf("%04d-%02d-%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday);
my $timestr = sprintf("%02d:%02d", $tm->hour, $tm->min); 
my $timeOfDay = $tm->hour;

my $email_html = "This email contains any scheduled treatments not marked as completed.  It was run on: $datetimestr.<p>";
my $results;
my $send_email = 0;

#we find any rooms lacking obs for today
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'ehr',
    -queryName => 'RoomsWithoutObsToday',
    -filterArray => [
    	['hasObs', 'eq', 'N'],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: The following rooms do not have any obs for today as of $timestr.</b> ";
	$email_html .= "<a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=ehr&query.queryName=RoomsWithoutObsToday"."'>Click here to view them</a><p>\n";

    foreach my $row (@{$results->{rows}}){
    	$email_html .= $row->{'room'}."<br>";
    }

	$email_html .= "<hr>\n";
}


#we find any treatments where the animal is not assigned to that project
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'treatmentSchedule',
    -filterArray => [
    	['Id/DataSet/Demographics/calculated_status', 'eq', 'Alive'],
		['projectStatus', 'isnonblank', ''],
		['date', 'dateeq', $datestr],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." scheduled treatments where the animal is not assigned to the project.</b><br>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=treatmentSchedule&query.projectStatus~isnonblank&query.Id/DataSet/Demographics/calculated_status~eq=Alive&query.date~dateeq=$datestr"."'>Click here to view them</a><br>\n";
	$email_html .= "<hr>\n";
}


#we find treatments for each time of day:
processTreatments('AM', 9);
processTreatments('Noon', 12);
processTreatments('PM', 14);
processTreatments('Any Time', 14);
processTreatments('Night', 17, 1);

my $hasTreatments = 0;

sub processTreatments {
	my $timeofday = shift;
	my $minTime = shift;
	my $noSendUnlessTreatments = shift;

	$results = LabKey::Query::selectRows(
	    -baseUrl => $baseUrl,
	    -containerPath => $studyContainer,
	    -schemaName => 'study',
	    -queryName => 'treatmentSchedule',
	    -columns => 'Id,CurrentArea,CurrentRoom,CurrentCage,projectStatus,treatmentStatus,treatmentStatus/Label,meaning,code,,volume2,conc2,route,amount2,remark,performedby',
	    -sort => 'CurrentArea,CurrentRoom',
	    -filterArray => [
	    	['date', 'dateeq', $datestr],
	    	['timeofday', 'eq', $timeofday],
	    	#['CurrentArea', 'in', join(';', @$areas)],
			['Id/DataSet/Demographics/calculated_status', 'eq', 'Alive'],
	    ],
        -requiredVersion => 8.3,
	    #-debug => 1,
	);

	$email_html .= "<b>$timeofday Treatments:</b><br>";

	#print "We have rows: ".scalar @{$results->{rows}}."\n";
	if(!@{$results->{rows}}){
		$email_html .= "There are no scheduled $timeofday treatments as of $timestr. Treatments could be added after this email was sent, so please check online closer to the time.<hr>";
		if($timeOfDay >= $minTime && $noSendUnlessTreatments){
			$send_email = 0;
		}
	}
	else {
		my $complete = 0;
		my $incomplete = 0;
		my $summary = {};
	    foreach my $row (@{$results->{rows}}){
			if($row->{'treatmentStatus/Label'} && $row->{'treatmentStatus/Label'} eq 'Completed'){
				$complete++;
			}
			else {
				if(!$$summary{$row->{'CurrentArea'}}){
					$$summary{$row->{'CurrentArea'}} = {};
				}
				if(!$$summary{$row->{'CurrentArea'}}{$row->{'CurrentRoom'}}){
					$$summary{$row->{'CurrentArea'}}{$row->{'CurrentRoom'}} = {complete=>0,incomplete=>0,incompleteRecords=>[]};
				}

				$$summary{$row->{'CurrentArea'}}{$row->{'CurrentRoom'}}{incomplete}++;
				push(@{$$summary{$row->{'CurrentArea'}}{$row->{'CurrentRoom'}}{incompleteRecords}}, $row);

				$incomplete++;
			}
	    };

		my $url = "<a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=treatmentSchedule&query.timeofday~eq=$timeofday&query.date~dateeq=$datestr&query.Id/DataSet/Demographics/calculated_status~eq=Alive"."'>Click here to view them</a></p>\n";
		$email_html .= "There are ".@{$results->{rows}}." scheduled $timeofday treatments.  $complete have been completed.  $url<p>\n";

		if($timeOfDay >= $minTime){
			if(!$incomplete){
				$email_html .= "All scheduled $timeofday treatments have been marked complete as of $datetimestr.<p>\n";

				if($noSendUnlessTreatments){
					$send_email = 0;
				}
			}
			else {
				$email_html .= "The following $timeofday treatments have not been marked complete as of $datetimestr:<p>\n";
				$send_email = 1;

				my $prevRoom = '';
				foreach my $area (sort(keys %$summary)){
					my $rooms = $$summary{$area};
					$email_html .= "<b>$area:</b><br>\n";
					foreach my $room (sort(keys %$rooms)){
						if($$rooms{$room}{incomplete}){
							$email_html .= "$room: ".$$rooms{$room}{incomplete}."<br>\n";
							$email_html .= "<table border=1><tr><td>Id</td><td>Treatment</td><td>Route</td><td>Concentration</td><td>Amount To Give</td><td>Volume</td><td>Instructions</td><td>Ordered By</td></tr>";

							foreach my $rec (@{$$rooms{$room}{incompleteRecords}}){
								$email_html .= "<tr><td>".$$rec{Id}."</td><td>".($$rec{meaning} ? $$rec{meaning} : '')."</td><td>".($$rec{route} ? $$rec{route} : '')."</td><td>".($$rec{conc2} ? $$rec{conc2} : '')."</td><td>".($$rec{amount2} ? $$rec{amount2} : '')."</td><td>".($$rec{volume2} ? $$rec{volume2} : '')."</td><td>".($$rec{remark} ? $$rec{remark} : '')."</td><td>".($$rec{performedby} ? $$rec{performedby} : '')."</td></tr>";
							}

							$email_html .= "</table><p>\n";
						}

					}
					$email_html .= "<p>";
				}
			}
		}
		else {
			$email_html .= "It is too early in the day to send warnings about incomplete treatments\n";
		}

		$email_html .= "<hr>";
	}
}


#then any treatments from today that different from the order:
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'TreatmentsThatDiffer',
    -columns => '*',
    -filterArray => [
    	['date', 'dateeq', $datestr],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

$email_html .= "<b>Treatments that differ from what was ordered:</b><p />";

if(!@{$results->{rows}}){
	$email_html .= "All entered treatments given match what was ordered.<hr>";
}
else {
	$email_html .= "<a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=TreatmentsThatDiffer&query.date~dateeq=$datestr"."'>Click here to view them</a><p />\n";

	my $summary = {};
    foreach my $row (@{$results->{rows}}){
		if(!$$summary{$row->{'CurrentArea'}}){
			$$summary{$row->{'CurrentArea'}} = {};
		}
		if(!$$summary{$row->{'CurrentArea'}}{$row->{'CurrentRoom'}}){
			$$summary{$row->{'CurrentArea'}}{$row->{'CurrentRoom'}} = [];
		}

		push(@{$$summary{$row->{'CurrentArea'}}{$row->{'CurrentRoom'}}}, $row);
    };

	my $prevRoom = '';
	foreach my $area (sort(keys %$summary)){
		my $rooms = $$summary{$area};
		$email_html .= "<b>$area:</b><br>\n";
		foreach my $room (sort(keys %$rooms)){
			$email_html .= "$room: ".@{$$rooms{$room}}."<br>\n";
			$email_html .= "<table border=1>\n";
			foreach my $rec (@{$$rooms{$room}}){
				$email_html .= "<tr><td>";
				$email_html .= 'Id: '.$$rec{id}."<br>\n";
				$email_html .= 'Date: '.$$rec{date}."<br>\n";
				$email_html .= 'Treatment: '.$$rec{meaning}."<br>\n";
				$email_html .= 'Ordered By: '.$$rec{performedby}."<br>\n";
				$email_html .= 'Performed By: '.$$rec{drug_performedby}."<br>\n";

				if(defined $$rec{route} && $$rec{route} ne $$rec{drug_route}){
					$email_html .= 'Route Ordered: '.$$rec{route}."<br>\n";
					$email_html .= 'Route Entered: '.$$rec{drug_route}."<br>\n";
				}
				if(defined $$rec{concentration} && ($$rec{concentration} != $$rec{drug_concentration} || $$rec{conc_units} ne $$rec{drug_conc_units})){
					$email_html .= 'Concentration Ordered: '.$$rec{concentration}.' '.$$rec{conc_units}."<br>\n";
					$email_html .= 'Concentration Entered: '.$$rec{drug_concentration}.' '.$$rec{drug_conc_units}."<br>\n";
				}
				if(defined $$rec{dosage} && ($$rec{dosage} != $$rec{drug_dosage} || $$rec{dosage_units} ne $$rec{drug_dosage_units})){
					$email_html .= 'Dosage Ordered: '.$$rec{dosage}.' '.$$rec{dosage_units}."<br>\n";
					$email_html .= 'Dosage Entered: '.$$rec{drug_dosage}.' '.$$rec{drug_dosage_units}."<br>\n";
				}
				if(defined $$rec{amount} && ($$rec{amount} != $$rec{drug_amount} || $$rec{amount_units} ne $$rec{drug_amount_units})){
					$email_html .= 'Amount Ordered: '.$$rec{amount}.' '.$$rec{amount_units}."<br>\n";
					$email_html .= 'Amount Entered: '.$$rec{drug_amount}.' '.$$rec{drug_amount_units}."<br>\n";
				}
				if(defined $$rec{volume} && ($$rec{volume} != $$rec{drug_volume} || $$rec{vol_units} ne $$rec{drug_vol_units})){
					$email_html .= 'Volume Ordered: '.$$rec{volume}.' '.$$rec{vol_units}."<br>\n";
					$email_html .= 'Volume Entered: '.$$rec{drug_volume}.' '.$$rec{drug_vol_units}."<br>\n";
				}

				$email_html .= "</td></tr>\n";
			}
			$email_html .= "</table>\n";
			$email_html .= "<p>\n";
		}

		$email_html .= "<p>";
	}

	$email_html .= "<hr>";
}


#we find any treatments where the animal is not alive
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Treatment Orders',
    -filterArray => [
    	['Id/DataSet/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." active treatments for animals not currently at WNPRC.</b>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Treatment Orders&query.enddate~isblank&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";
}

#we find any problems where the animal is not alive
$results = LabKey::Query::selectRows(
    -baseUrl => $baseUrl,
    -containerPath => $studyContainer,
    -schemaName => 'study',
    -queryName => 'Problem List',
    -filterArray => [
    	['Id/DataSet/Demographics/calculated_status', 'neqornull', 'Alive'],
		['enddate', 'isblank', ''],
    ],
    -requiredVersion => 8.3,
    #-debug => 1,
);

if(@{$results->{rows}}){
	$email_html .= "<b>WARNING: There are ".@{$results->{rows}}." unresolved problems for animals not currently at WNPRC.</b>";
	$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=Problem List&query.enddate~isblank&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive"."'>Click here to view and update them</a><br>\n";
	$email_html .= "<hr>\n";
}


# Check for missing In Rooms after 2:30pm, as specified in the SOP
my $hour = $tm->hour;
my $minute = $tm->min;
if ($hour > 14 || (($hour == 14) && ($minute >= 30))) {
	$results =  LabKey::Query::selectRows(
        -baseUrl => $baseUrl,
        -containerPath => $studyContainer,
        -schemaName => 'study',
        -queryName => 'inRoomNotSubmitted',
        -columns => '*',
        -requiredVersion => 8.3
	);

	my $in_rooms_href = $baseUrl . "query/" . $studyContainer . "executeQuery.view?schemaName=study&query.queryName=inRoomNotSubmitted";
	my $num_incomplete_in_rooms = scalar(@{$results->{rows}});

	my $prefix = ($num_incomplete_in_rooms > 0) ? "WARNING: " : "";
    $email_html .= "<b>${prefix}There are " . $num_incomplete_in_rooms . " <a href='" . $in_rooms_href . "'>animals without In Rooms</a></b>";

    $email_html .= "<br>\n";
    $email_html .= "<hr>\n";
}


#print "Send email: \"$send_email\"";
if($send_email){
#	open(HTML, ">", "C:\\Users\\Admin\\Desktop\\test.html");
#	print HTML $email_html;
#	close HTML;
#	die;

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
			          Subject =>"Subject: Animal Care Alerts: $datestr",
			          Type    =>'multipart/alternative'
			          );
			$smtp->attach(Type => 'text/html',
			          Encoding => 'quoted-printable',
			          Data	 => $email_html
			);
			#print $smtp->as_string();
			$smtp->send() || die;
		}
	}
}

touch(File::Spec->catfile(dirname(abs_path($0)), '.treatmentAlertsLastRun'));
