#!/usr/bin/perl

=head1 DESCRIPTION

This script is designed to extract specific tables from LabKey to TSV files.
It will hash specific fields using the included java hasher.class file.

It was originally created for the purpose of automating anonymized extracts to be placed on the BIRN.
It could be modified to output any sort of TSV.  It is designed to be connected to the table ehr.extracts,
which would have 1 row per query to be output.  This part could be modified as needed.

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
use File::Spec;
use File::Path qw(make_path);
use Time::localtime;
use File::Copy;

#my $output_dir = '/usr/local/labkey/extracts';
#my $final_dir = '/usr/local/labkey/birn/';
my $output_dir = '/home/fedora/Desktop/labkey/extracts';
my $final_dir = '/home/fedora/Desktop/labkey/birn/';
my $default_container = '/WNPRC/EHR';
my $prefix = 'WNPRC';
my $delim = '.';

make_path($output_dir);
make_path($final_dir);

# Find today's date to append to filenames
my $tm = localtime;
my $datestr=sprintf("%04d%02d%02d_%02d%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);


sub extractTSV {
	my $args = shift;
	my $results = Labkey::Query::selectRows(
		-baseUrl => 'https://ehr.primate.wisc.edu/',
		-containerPath => $args->{containerPath} || $default_container,
		-schemaName => $args->{schemaName},
		-queryName => $args->{queryName},
		-viewName => $args->{viewName},
		-columns => $args->{columns},
        -requiredVersion => 8.3,
		#-maxRows => 1,		
	);	

    my $fn = $args->{fileName} ? $args->{fileName} : join($delim, $prefix, $args->{queryName}, "$datestr.tsv");
	my $file = File::Spec->catfile($output_dir, $fn);
	open(OUTPUT, ,">", $file);

	my @fields;
	foreach my $field (@{$results->{metaData}->{fields}}){	
		push(@fields, $field->{name});
	}
	print OUTPUT join("\t", @fields) . "\n";
		
	foreach my $row (@{$results->{rows}}){	
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
	};
		
	close OUTPUT;	
	
	return $file;	
}

my $results = Labkey::Query::selectRows(
	-baseUrl => 'https://ehr.primate.wisc.edu/',
	-containerPath => '/WNPRC/EHR',
	-schemaName => 'ehr',
	-queryName => 'extracts',
	-requiredVersion => 8.3,
#	-debug => 1,		
);	

foreach (@{$results->{rows}}){
    #run API to get records
    my $file = extractTSV($_);

    #run hasher    
    unlink $file.".orig" if (-e $file.".orig");
    
    $_->{fieldsToHash} =~ s/,/ /g;
    my $cmd = "java hasher WNPRC $file ".$_->{fieldsToHash};
    system($cmd);
         
    #copy new file to BIRN
    copy($file, $final_dir);
}
