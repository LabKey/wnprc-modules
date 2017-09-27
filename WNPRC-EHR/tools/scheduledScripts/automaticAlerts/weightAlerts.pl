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

my $notificationtypes = 'Weight Drops';
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
use File::Touch;
use File::Spec;
use File::Basename;
use Cwd 'abs_path';
use List::MoreUtils qw/ uniq /;

# Find today's date
# Find today's date
my $tm = localtime;
my $datetimestr=sprintf("%04d-%02d-%02d at %02d:%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);
my $datestr=sprintf("%04d-%02d-%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday);

my $yesterday = localtime( ( time() - ( 24 * 60 * 60 ) ) );
$yesterday = sprintf("%04d-%02d-%02d", $yesterday->year+1900, ($yesterday->mon)+1, $yesterday->mday);

my $threeDaysAgo = localtime( ( time() - ( 3 * 24 * 60 * 60 ) ) );
$threeDaysAgo = sprintf("%04d-%02d-%02d", $threeDaysAgo->year+1900, ($threeDaysAgo->mon)+1, $threeDaysAgo->mday);


my $email_html = "This email contains alerts of weight changes of +/- 10% or greater.  It was run on: $datetimestr.<p>";
my $results;


#first we find all living animals without a weight:
$results = Labkey::Query::selectRows(
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


#then we find all weight drops of >10% in the past 30 days
processWeights(0, 30, 'lte', -10);
processWeights(0, 30, 'gte', 10);

#processWeights(7, 30, 'lte', -10);
#processWeights(7, 30, 'gte', 10);

#processWeights(30, 90, 'lte', -10);
#processWeights(30, 90, 'gte', 10);

#processWeights(90, 180, 'le', -10);
#processWeights(90, 180, 'gte', 10);


sub processWeights {
	my $min = shift;
	my $max = shift;
	my $pctFilter = shift;
	my $pct = shift;
	
	$results = Labkey::Query::selectRows(
	    -baseUrl => $baseUrl,
	    -containerPath => $studyContainer,
	    -schemaName => 'study',
	    -queryName => 'weightRelChange',
		-columns => 'Id,Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,LatestWeightDate,LatestWeight,date,weight,PctChange,IntervalInDays',
		-sort => 'Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,Id',
		-filterArray => [
			['Id/DataSet/Demographics/calculated_status', 'eq', 'Alive'],
			['PctChange', $pctFilter, $pct],
			['LatestWeightDate', 'dategte', $threeDaysAgo],	
			['IntervalInDays', 'gte', $min],
			['IntervalInDays', 'lte', $max],	
		],
		-requiredVersion => 8.3,
	    #-debug => 1,
	);
	
	$email_html .= "<b>Weights since $threeDaysAgo representing changes of ".$pct."% in the past $max days:</b><br>";
	
	if(!@{$results->{rows}}){
		$email_html .= "There are no changes during this period.<hr>";	
	}		
	else {	
		my $total = 0;
		my $summary;
	    foreach my $row (@{$results->{rows}}){
			if(!$$summary{$row->{'Id/curLocation/area'}}){
				$$summary{$row->{'Id/curLocation/area'}} = {};				
			}	
			if(!$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}}){
				$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}} = {records=>[]};				
			}	
			
			push(@{$$summary{$row->{'Id/curLocation/area'}}{$row->{'Id/curLocation/room'}}{records}}, $row);		
			$total++;	
	    };
	    
		my $prevRoom = '';
		$email_html .= "<table border=1><tr><td>Id</td><td>Area</td><td>Room</td><td>Cage</td><td>Current Weight (kg)</td><td>Weight Date</td><td>Previous Weight (kg)</td><td>Date</td><td>Percent Change</td><td>Days Between</td></tr>";
		foreach my $area (sort(keys %$summary)){
			my $rooms = $$summary{$area};			
			foreach my $room (sort(keys %$rooms)){
				foreach my $rec (@{$$rooms{$room}{records}}){			
					$email_html .= "<tr><td><a href='".$baseUrl."ehr/".$studyContainer."animalHistory.view?#_inputType:renderSingleSubject&_showReport:1&subject:".$$rec{Id}."&combineSubj:true&activeReport:abstract'>".$$rec{Id}."</a></td><td>$area</td><td>$room</td><td>".$$rec{'Id/curLocation/cage'}."</td><td>".$$rec{LatestWeight}."</td><td>".$$rec{LatestWeightDate}."</td><td>".$$rec{weight}."</td><td>".$$rec{date}."</td><td>".$$rec{PctChange}."</td><td>".$$rec{IntervalInDays}."</td></tr>";
				}								  	
			}			
		}
		
		$email_html .= "</table><p>\n";	  	    	
#		$email_html .= "<p><a href='".$baseUrl."query/".$studyContainer."executeQuery.view?schemaName=study&query.queryName=weightRelChange&query.Id/DataSet/Demographics/calculated_status~eq=Alive&query.PctChange~$pctFilter=$pct&query.IntervalInDays~gte=".$min."&query.IntervalInDays~lte=".$max."&query.LatestWeightDate~dategte=$threeDaysAgo'>Click here to view these animals</a></p>";
	    $email_html .= '<hr>';
	}
}


#open(HTML, ">", "C:\\Users\\Admin\\Desktop\\test.html");
#print HTML $email_html;
#close HTML;

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
		          Subject =>"Subject: Weight Alerts: $datestr",
		          Type    =>'multipart/alternative'
		          );
		$smtp->attach(Type => 'text/html',
		          Encoding => 'quoted-printable',
		          Data	 => $email_html
		);         
		$smtp->send() || die;
	}
}

touch(File::Spec->catfile(dirname(abs_path($0)), '.weightAlertsLastRun'));

