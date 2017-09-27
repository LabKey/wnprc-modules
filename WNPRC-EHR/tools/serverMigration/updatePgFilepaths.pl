#!/usr/bin/perl

=head1 DESCRIPTION

Created 5-1-11 by bbimber

This script is designed to update hard-coded filepaths in a labkey server db.  It will generate a SQL
script that can be run outside of this script.

It was originally needed because when we migrated from xnight (OSX server) to ehr (linux server) the local filepath of the labkey root changed.
This script served to update any hard-coded filepaths stored in postgres.

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
use strict;



#for generic SAN paths
my $old_path = '/Volumes/storagepool/';
my $new_path = '/storagepool/';

#for the labkey file root
my $old_path = '/Volumes/storagepool/labkey/files/';
my $new_path = '/usr/local/labkey/files/';


#in the form of schema/table => fieldname
my $tables = {
    'core.mappeddirectories' => 'path',
    'exp.data' => 'datafileurl',
    'exp.experimentrun' => 'filepathroot',
    'filecontent.fileroots' => 'path',
    'genotyping.analyses' => 'path',
    'genotyping.runs' => 'path',
    'ms2.fractions' => 'filename',
    'ms2.runs' => 'path',
    'ms2.proteinprophetfiles' => 'filepath',
    'pipeline.pipelineroots' => 'path',
    'pipeline.statusfiles' => 'filepath',
    'prot.annotinsertions' => 'filename',
    'prot.fastafiles' => 'path',
    'prot.fastaloads' => 'path',
    'study.uploadlog' => 'filepath',
};


##dont edit below here

foreach(keys %$tables) {
    print "SELECT * FROM $_ WHERE ".$$tables{$_}." ILIKE '%$old_path%';\n";
}

foreach(keys %$tables) {
    print "UPDATE $_ SET ".$$tables{$_}."=regexp_replace(".$$tables{$_}.", '$old_path', '$new_path', 'i') WHERE ".$$tables{$_}." ILIKE '%$old_path%';\n";
}
