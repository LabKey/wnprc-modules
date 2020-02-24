#!/usr/bin/env perl

use warnings;
use LabKey::Query;
use Data::Dumper;
use File::Spec;
use File::Path qw(make_path);
use Time::localtime;
use File::Copy;
use strict;

my $baseUrl = $ENV{'LK_BASE_URL'};

my $lk_config = LabKey::Query::_readrc();

#Fetch the actual data from the query
my $request = HTTP::Request->new( "GET" => $baseUrl."/query/WNPRC/EHR/updateSnapshot.view?schemaName=study&snapshotName=ActiveHousing");
if($lk_config){
	$request->authorization_basic( $$lk_config{'login'}, $$lk_config{'password'} );
}
my $ua = new LWP::UserAgent;
$ua->agent("Perl API Client/1.0");
my $response = $ua->request($request);
