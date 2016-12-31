#!/usr/bin/perl

=head1 DESCRIPTION

This script is designed to run as a cron job that will permanently delete
and record in a study dataset with a QCState of 'Review Requested'.

This was created because conventional deletes were running extremely slow in the 
EHR.  This is a non-optimal mechanism that allows the user to avoid needing to
perform an actual delete.  Through the UI, they change the QCState of a record
to 'Delete Requested'.  This script periodically runs to clean out these records
in the background.


=head1 LICENSE

This package and its accompanying libraries are free software; you can
redistribute it and/or modify it under the terms of the GPL (either
version 1, or at your option, any later version) or the Artistic
License 2.0.

=head1 AUTHOR

Ben Bimber

=cut

use strict;
use Labkey::Query;
use Data::Dumper;
use Time::localtime;
use File::Touch;
use Cwd;
use File::Spec;
use File::Copy;
use File::Basename;


my @fileparse = fileparse($0, qr/\.[^.]*/);
my $folder = $fileparse[1];
#print $folder.']';
chdir($folder);

my $log_file = File::Spec->catfile($folder, 'deleteLog.txt');
#my $lock_file = File::Spec->catfile($folder, '.lock');

my $default_container = '/WNPRC/EHR';
my $baseUrl = 'https://localhost/';

# Find today's date to append to filenames
my $tm = localtime;
my $datestr=sprintf("%04d%02d%02d_%02d%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);

my $twoDaysAgo = localtime( ( time() - ( 2 * 24 * 60 * 60 ) ) );
$twoDaysAgo = sprintf("%04d-%02d-%02d", $twoDaysAgo->year+1900, ($twoDaysAgo->mon)+1, $twoDaysAgo->mday);

#if(-e $lock_file){
#    print "$datestr\tLock file present\n";
#    exit 0;
#}

#touch($lock_file);

open(OUTPUT,">>", $log_file) || die "Unable to open file";
flock(OUTPUT, 2) || die "Unable to open file";

my $datasets = findDatasets();
foreach my $dataset (@$datasets){
    doDelete('study', $dataset, 'lsid')
}

doDelete('ehr', 'tasks', 'taskid', '*');
doDelete('ehr', 'requests', 'requestid', '*');
doDelete('ehr', 'cage_observations', 'rowid', '*');

sub doDelete {
    my $schema = shift;
    my $query = shift;
    my $pk = shift;
    my $columns = shift;

	#we delete all rows with QCstate of "Delete Requested"
	my $results = Labkey::Query::selectRows(
		-baseUrl => $baseUrl,
		-containerPath => $default_container,
		-schemaName => $schema,
		-queryName => $query,
		-filterArray => [['QCState/Label', 'eq', 'Delete Requested']],
		-columns => $columns,
		-requiredVersion => 8.3,
		#-debug => 1,
	);	
	handleResults($results, $schema, $query, $pk);	

	#and delete anything with a QCState of "Request: Denied" modified more than 2 days ago.
	$results = Labkey::Query::selectRows(
		-baseUrl => $baseUrl,
		-containerPath => $default_container,
		-schemaName => $schema,
		-queryName => $query,
		-filterArray => [['QCState/Label', 'eq', 'Request: Denied'], ['modified', 'datelt', $twoDaysAgo]],
		-columns => $columns,
		-requiredVersion => 8.3,
		#-debug => 1,
	);	
	handleResults($results, $schema, $query, $pk);		
}

sub handleResults {
	my $results = shift;
	my $schema = shift;
	my $query = shift;
	my $pk = shift;
	
	my $toDelete = [];
	if(@{$results->{rows}}){
		my @fields;
		foreach my $field (@{$results->{metaData}->{fields}}){	
			push(@fields, $field->{name});
		};
		print OUTPUT "\nSTART: $datestr, $schema, $query\n";
		print OUTPUT join("\t", @fields) . "\n";			
		
		foreach my $row (@{$results->{rows}}){	
			push(@$toDelete, {$pk => $$row{$pk}});
			
			my @line;						
			foreach (@fields){			
				if ($row->{$_}){
					push(@line, $row->{$_});
				}			
				else {
					push(@line, "");
				}		 			
			}				
			print OUTPUT join("\t", @line);
			print OUTPUT "\n";				
		}
	}
			
	if(@$toDelete){
		my $results = Labkey::Query::deleteRows(
			-baseUrl => $baseUrl,
			-containerPath => $default_container,
		    	-schemaName => $schema,
	    		-queryName => $query,
			-rows => $toDelete,
		);			
		
		my $tm = localtime;
		my $datestr=sprintf("%04d%02d%02d_%02d%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);
		
		print OUTPUT "Done Deleting ".@$toDelete." Rows For: $schema . $query, $datestr";
	}			
}
 
sub findDatasets {
	my $results = Labkey::Query::selectRows(
		-baseUrl => $baseUrl,
		-containerPath => $default_container,
		-schemaName => 'study',
		-queryName => 'datasets',
		-filterArray => [['KeyManagementType', 'eq', 'GUID']],
		-requiredVersion => 8.3,
	);
	
	my $datasets = [];
	
	foreach my $row (@{$results->{rows}}){	
		push(@$datasets, $$row{'Label'});
	}	
	
	return $datasets;						
}
	
touch($log_file);
close OUTPUT;


