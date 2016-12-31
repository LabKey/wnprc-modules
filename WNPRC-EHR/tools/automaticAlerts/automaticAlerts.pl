#!/usr/bin/perl

=head1 DESCRIPTION

This script is designed to run as a cron job.  It will query the table ehr.automatic_alerts.
This table contains a series of queries/views to be run.  Each of these tables will be queried, and
if any rows are returned, they will be emailed to anyone subscribing to the notificationtype specified
in the table.


=head1 LICENSE

This package and its accompanying libraries are free software; you can
redistribute it and/or modify it under the terms of the GPL (either
version 1, or at your option, any later version) or the Artistic
License 2.0.

=head1 AUTHOR

Ben Bimber

=cut

use Labkey::Query;
use Data::Dumper;
use Time::localtime;


#config options:
#my $baseUrl = 'https://ehr.primate.wisc.edu/';
my $baseUrl = 'http://localhost:8080/labkey/';

# Find today's date to append to filenames
my $tm = localtime;
my $datestr=sprintf("%04d%02d%02d_%02d%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);


#first we identify all alerts to process
my $results = Labkey::Query::selectRows(
	-baseUrl => $baseUrl,
	-containerPath => '/WNPRC/EHR',
	-schemaName => 'ehr',
	-queryName => 'automatic_alerts',
	-requiredVersion => 8.3,
	#-debug => 1,
);

foreach (@{$results->{rows}}){
    #run API to get records
    my $email = processAlert($_);

    print $email;
}


sub processAlert {
	my $args = shift;

	#print Dumper($args);
	my $results = Labkey::Query::selectRows(
		-baseUrl => $baseUrl,
		-containerPath => $args->{containerpath},
		-schemaName => $args->{schemaname},
		-queryName => $args->{queryname},
		-viewName => $args->{viewname},
		-requiredVersion => 8.3,
		#-maxRows => 1,		
	);	

    if(!@{$results->{rows}}){
        return;
    }

	my $url = $baseUrl
	  . "query/"
	  . $$args{'containerpath'} . '/'
	  . "executeQuery.view?schemaName="
	  . $$args{'schemaname'}
	  . "&query.queryName="
	  . $$args{'queryname'}
	  . "&query.viewName="
	  . $$args{'viewname'};

    my $html = $args->{email_html}."<p>Below are the records.  Click <a href='$url'>here</a> to view them directly<p>";

    $html .= '<table border=1>';
    my @fields;
    foreach my $field (@{$results->{metaData}->{fields}}){
    	if(!$field->{'isHidden'}){
        	push(@fields, $field->{'caption'});
    	}
    }
    $html .= '<tr><td>'.join("</td><td>", @fields) . "</td></tr>";

    foreach my $row (@{$results->{rows}}){
        my @line;
        foreach my $field (@{$results->{metaData}->{fields}}){
        	if(!$field->{'isHidden'}){
	            if ($row->{$field->{'name'}} && ref $row->{$field->{'name'}} eq 'ARRAY'){            		            	
	                push(@line, join(';', @{$row->{$field->{'name'}}}));
	            }
	            elsif ($row->{$field->{'name'}}){
	            	push(@line, $row->{$field->{'name'}});
	            }
	            else {
	                push(@line, "");
	            }
        	}
        }

        $html .= '<tr><td>'.join("</td><td>", @line) . "</td></tr>";

    };

    $html .= '</table>';

    return $html;
}


