#!/usr/bin/env perl

=head1 NAME

lkServerBackup.pl

=head1 DESCRIPTION

This script is used to backup LabKey servers

One or more DB schemas can be selected. Each schema gets dumped into a separate file. These
files are automatically rotated according to the user defined schedule.

=head1 LICENSE

This package and its accompanying libraries are free software; you can
redistribute it and/or modify it under the terms of the GPL (either
version 1, or at your option, any later version) or the Artistic
License 2.0.

=head1 AUTHOR

Ben Bimber

bimber at wisc dot edu

=head1 USAGE

All config settings are specified in an INI file in the same folder as this script. Below
is a sample INI.

When the script completes it will write to a logfile and touch the file called '.last_backup'
located in the backup directory. This file can be used by monit or other system monitoring
programs to gauge backup success.

This script can save a record in a labkey list the job completes.  This requires
several steps:

To save a log in labkey, you must provide the baseURL and a containerPath for your labkey server.  Entries
will be made in the audit.auditLog table.  If selected, authentication to LabKey is handled using a file
named .netrc located in the user's home directory. The machine in the netrc file should match the domain of
your labkey URL.

NOTE: Crypt::SSLeay or Net::SSLeay required for HTTPS

Example .netrc file:

machine labkey.com
login backup_user@wisc.edu
password yourPassword


You must also include a [lk_config] section in the INI file.  Below is an example INI
file with comments explaining each line.

[general]
compress = 1	    					;0 or 1.  determines whether DB dumps are compressed. if using postgres custom format, it will not re-compress the file
pg_dbname = labkey           			;name of postgres schema(s).  separate multiple schemas with whitespace (ie. 'labkey postgres').  the name 'globals' can be used to run pg_dumpall to backup global items
pgdump_format = c           			;format used by pgdump.  see pgdump doc.
pg_host = someserver.com	 			;the postgres host.  can be omitted if running on the same server
pg_user = labkey	    				;user connecting to postgres. can be omitted if using IDENT or other form of authentication
pg_path = /usr/local/pgsql/bin			;optional. the location of pg_dump
backup_dest = /labkey/backup/  			;the directory where backups will be stored
tar_backup_dirs = /labkey/files/		;optional. a whitespace separated list of folders to be archived into a TAR file.
tar_excluded_dirs = /labkey/backup*		;optional. a whitespace separated list of patterns to be excluded from the TAR file.
rsync_backup_dir = /usr/local/labkey	;optional. a folder to be copied using rsync

[lk_config]                            ;Section Optional.
baseURL= https://ehr.primate.wisc.edu  ;url of your server
containerPath = shared          	   ;the containerPath where you want to insert the record


[file_rotation]		;can be omited, which will use defaults
maxDaily = 7		;maximum daily backups to keep.  default: 7
maxWeekly = 5		;maximum daily backups to keep.  default: 5
maxMonthly = 100	;maximum daily backups to keep.  default: 0


The restore procedure for one of the backup files should be roughly the following commands,
assuming your DB is named 'labkey':

dropdb -U labkey labkey
createdb -U labkey -O labkey -E UTF8 -T template0 labkey
pg_restore -d labkey -U labkey [filename]

=over

=cut

#should be included with perl install
use strict;
use warnings;

use Time::localtime;
use FileHandle;
use File::Spec;
use File::Basename;
use File::Copy;
use Config::Abstract::Ini;
use Archive::Tar;
use Log::Rolling;
use Data::Dumper;
use LabKey::Query;
use File::Touch;
use File::Path qw(make_path);
use Cwd;
use Cwd qw(chdir);

# get INI file.  this should allow a filepath relative to this script
my @fileparse = fileparse($0, qr/\.[^.]*/);
my $settings = new Config::Abstract::Ini(File::Spec->catfile($fileparse[1], 'lkbackup.ini'));

my %config = $settings->get_entry('general');
my %lk_config = $settings->get_entry('lk_config');
my %rotation = $settings->get_entry('file_rotation');

# Variables
my ($path, $status);

# Find today's date to append to filenames
my $tm = localtime;
my $datestr = sprintf("%04d%02d%02d_%02d%02d", $tm->year + 1900, ($tm->mon) + 1, $tm->mday, $tm->hour, $tm->min);

# make sure the destination folder exists

chdir($config{backup_dest});
checkFolder($config{backup_dest});

my $log = Log::Rolling->new(
    log_file => File::Spec->catfile($config{backup_dest}, "lk_backup.log"),
    max_size => 50000
);

$log->entry("Backup is starting");
$log->entry("Current Working Dir: " . getcwd());
$log->commit;

my $errors = [];

#add postgres to path
if ($config{pg_path}) {
    $ENV{'PATH'} = $ENV{'PATH'} . ':' . $config{pg_path};
}

if (!-e $config{backup_dest}) {
    onExit("Unable to create backup directory");
}

#check required params
my @required = qw(backup_dest);
foreach (@required) {
    if (!$config{$_}) {
        $log->entry("Missing param: $_ from INI file");
        $log->commit;
        onExit("Improper INI file");
    }
}

#the postgres backup
checkFolder(File::Spec->catfile($config{backup_dest}, "database"));
my @dbs = split(/\s/, $config{pg_dbname});
foreach (@dbs) {
    runPgBackup($_);
}

onExit();

sub runPgBackup {
    my $db = shift;

    my $file_prefix = $db . "_";
    my $pg_filename = $file_prefix . $datestr . ".pg";
    my $result = 0;

    my $backupdir = File::Spec->catfile($config{backup_dest}, "database");
    my $primatefsdir = File::Spec->catfile($config{primatefs_dest}, "database");

    $log->entry("Starting pg_dump of: $db");
    $log->commit;

    #run pg_dump and store in the daily backup folder
    $path = File::Spec->catfile($backupdir, "daily");
    checkFolder($path);

    my $dailyBackupFile = File::Spec->catfile($path, $pg_filename);
    if ($db eq 'globals') {
        $result = _pg_dumpall($dailyBackupFile, $db);
    }
    else {
        $result = _pg_dump($dailyBackupFile, $db);
    }

    if (!$result) {
        onExit();
    };

    if ($config{compress} && $config{pgdump_format} ne 'c') {
        $log->entry("Compressing file: $dailyBackupFile");
        $log->commit;
        $dailyBackupFile = _compressFile($dailyBackupFile, 1);
    }

    #rotate daily backups
    $rotation{'maxDaily'} ||= 7;
    _rotateFiles($path, $rotation{'maxDaily'}, $file_prefix);

    #copy/rotate additional daily backups
    if ($rotation{'maxDaily_PrFS'} > 0) {
        $path = File::Spec->catfile($primatefsdir, "daily");
        checkFolder($path);
        copy($dailyBackupFile, "/mnt/IT-Backups/$dailyBackupFile") or onExit("PrimateFS Daily Pgsql File Copy failed: $!");
        $rotation{'maxDaily_PrFS'} ||= 10;
        _rotateFiles($path, $rotation{'maxDaily_PrFS'}, $file_prefix);
    }

    #add/rotate weekly backups on saturday
    if ($tm->wday == 6 && $rotation{'maxWeekly'} > 0) {
        $path = File::Spec->catfile($primatefsdir, "weekly");
        checkFolder($path);
        my $weeklyFile = $dailyBackupFile;
        $weeklyFile =~ s/daily/weekly/;
        copy($dailyBackupFile, "/mnt/IT-Backups/$weeklyFile") or onExit("Weekly Pgsql File Copy failed: $!");
        $rotation{'maxWeekly'} ||= 5;
        _rotateFiles($path, $rotation{'maxWeekly'}, $file_prefix);
    }

    #add monthly backups on the 1st of the month.
    if ($tm->mday == 1 && $rotation{'maxMonthly'} > 0) {
        $path = File::Spec->catfile($primatefsdir, "monthly");
        checkFolder($path);
        my $monthlyFile = $dailyBackupFile;
        $monthlyFile =~ s/daily/monthly/;
        copy($dailyBackupFile, "/mnt/IT-Backups/$monthlyFile") or onExit("Monthly Pgsql File Copy failed: $!");
        _rotateFiles($path, $rotation{'maxMonthly'}, $file_prefix);
    }

    $log->entry("Backup of $db was successful");
    $log->commit;
}

=item onExit(string message, status)

onExit() will log the given message and die.

=cut

sub onExit {
    my $msg = shift;

    if (scalar(@$errors) > 0 && $$errors[0] ne '') {
        $status = "Error";
        $log->entry("Errors: " . "[@$errors]");
        $log->commit;
    }
    else {
        $status = "Success";
    }

    if ($msg) {
        $log->entry($msg);
        $log->commit;
    } else {
        $msg = 0;
    }

    # Insert a record into a labkey list
    if (%lk_config) {
        lk_log();
    }

    # Write Log messages to log file
    $log->entry('Backup complete: ' . $status);
    $log->commit;

    # touch a file to indicate success.  can be used /w monit
    touch(File::Spec->catfile($config{backup_dest}, ".last_backup")) if ($status eq "Success");

    exit $msg;
}


=item checkFolder($folder)

checkFolder() will check whether the $folder exists and create any needed subfolders

=cut

sub checkFolder {
    my $folder = shift;

    if (!-d $folder) {
        make_path($folder) || onExit "Could not create '" . $folder . "'";
        chmod 0700,
    }
}

=item _pg_dump($bkpostgresfile, $pg_dbname)

_pg_dump() will backup the schema defined by $pg_dbname into the file specified by $bkpostgresfile

=cut

sub _pg_dump {
    my $bkpostgresfile = shift;
    my $pg_dbname = shift;

    # Postgres Backup
    my $cmd = "pg_dump -F " . ($config{pgdump_format} ? $config{pgdump_format} : 't') . " " . $pg_dbname . " -f " . $bkpostgresfile;
    $cmd .= " -U " . $config{pg_user} if $config{pg_user};
    $cmd .= " -h " . $config{pg_host} if $config{pg_host};

    my $pgout = system($cmd);
    $log->entry($cmd);
    $log->commit;
    if ($?) {
        $log->entry("ERROR: Database backup of $pg_dbname has returned an error: $pgout");
        $log->commit;
        push(@$errors, "ERROR: Database backup of $pg_dbname has returned an error: $pgout");
    }
    else {
        $log->entry("pg_dump of $pg_dbname complete");
        $log->commit;
    }
    return 1;
}

=item _pg_dumpall($bkpostgresfile)

_pg_dumpall() will backup global settings into the file specified by $bkpostgresfile

=cut

sub _pg_dumpall {
    my $bkpostgresfile = shift;

    # Postgres Backup
    my $cmd = "pg_dumpall -g" . " -f " . $bkpostgresfile;
    $cmd .= " -U " . $config{pg_user} if $config{pg_user};
    $cmd .= " -h " . $config{pg_host} if $config{pg_host};
    my $pgout = system($cmd);
    $log->entry($cmd);
    $log->commit;
    if ($?) {
        $log->entry("ERROR: pg_dumpall has returned an error: $pgout");
        $log->commit;
        push(@$errors, "ERROR: pg_dumpall has returned an error: $pgout");
    }
    else {
        my $tm1 = localtime;
        $log->entry("pg_dumpall of globals complete");
        $log->commit;
    }
    return 1;
}

=item _compressFile(fileName, deleteOrig)

_compressFile() will compress the specified file.

=cut

sub _compressFile {
    my $origFile = shift;
    my $newFile = $origFile;
    my $deleteOrig = shift || 0;

    if ($^O eq "MacOS" || $^O eq 'linux' || $^O eq "darwin") {
        my $archive = system("gzip $origFile 2>&1");
        if ($?) {
            $log->entry("ERROR: Compression returned an error: $archive");
            $log->commit;
            onExit("Compression Error: $archive");
        }
        $newFile .= '.gz';
    }
    elsif ($^O eq 'MSWin32') {
        #this is really, really slow.  if you actually run this on a PC you should replace this with a system command
        my $archive = Archive::Tar->create_archive($origFile . '.gz', COMPRESS_GZIP, $origFile);

        if (!$archive) {
            $log->entry("ERROR: Compression returned an error:");
            $log->entry($archive->error);
            $log->commit;

            onExit("Compression Error: " . $archive->error);
        }
        $newFile .= '.gz';
    }
    else {
        onExit("Unrecognized OS: $^O");
    }

    $log->entry("Compression complete");
    $log->commit;

    if ($deleteOrig == 1) {
        unlink $origFile;
    }
    return $newFile;
}

=item _rotateFiles(directory, maxFiles, filePrefix)

_rotateFiles() will delete all files older than the 'maxFiles' with the given 'filePrefix'
in the specified 'directory'.

=cut

sub _rotateFiles {
    my $dir = shift;
    my $maxFiles = shift;
    my $filePrefix = shift;
    if (!$maxFiles) {return 1;}

    # Must be a directory.
    unless (-d $dir) {
        my $msg = (-e _ ? "$dir: not a directory" : "$dir: does not exist");
        $log->entry($msg);
        $log->commit;
        onExit($msg);
    }

    # We need write access since we are going to delete files.
    unless (-w _) {
        $log->entry("$dir: no write access");
        $log->commit;
        onExit("$dir: no write access");
    }

    # We need read acces since we are going to get the file list.
    unless (-r _) {
        $log->entry("$dir: no read access");
        $log->commit;
        onExit("$dir: no read access");
    }

    # Probably need this.
    unless (-x _) {
        $log->entry("$dir: no access");
        $log->commit;
        onExit("$dir: no access");
    }

    # Gather file names and ages.
    opendir(DIR, $dir) or onExit("dir: $!");

    my @files;
    foreach (readdir(DIR)) {
        next if /^\./;
        #limit to files matching this prefix in case other files are stored here
        next unless /^$filePrefix/;
        next unless -f File::Spec->catfile($dir, $_);
        push(@files, [ File::Spec->catfile($dir, $_), -M _ ]);
    }
    closedir(DIR);

    $log->entry("$dir: total of " . scalar(@files) . " files");
    $log->commit;

    # Complete if file count below max
    if (@files <= abs($maxFiles)) {
        $log->entry("$dir: not rotated, below max limit");
        $log->commit;
        return 1;
    }

    # Sort on age. Also reduces the list to file names only.
    my @sorted = map {$_->[0]} sort {$b->[1] <=> $a->[1]} @files;

    # Splice out the files to keep.
    if ($maxFiles < 0) {
        # Keep the oldest files (head of the list).
        splice(@sorted, 0, - $maxFiles);
    }
    else {
        # Keep the newest files (tail of the list).
        splice(@sorted, @sorted - $maxFiles, $maxFiles);
    }

    # Remove the rest.
    foreach (@sorted) {
        my $r = (!-e $_) * 2 || unlink $_;
        if ($r == 0) {
            onExit("Could not remove $_: $!");
        }
    }
    return 1;
}


=item lk_log()

lk_log() will add a record to the specified labkey list summarizing the backup status

=back

=cut

sub lk_log {
    my $date = sprintf("%04d-%02d-%02d %02d:%02d", $tm->year + 1900, ($tm->mon) + 1, $tm->mday, $tm->hour, $tm->min);
    LabKey::Query::insertRows(
        -baseUrl       => $lk_config{'baseURL'},
        -containerPath => $lk_config{'containerPath'} || "shared",
        -schemaName    => "auditLog",
        -queryName     => "Client API Actions",
        -rows          =>
        [ {
            "Key1"      => "LabKey Server Backup",
            "Comment"   => $status,
            "Date"      => $date
        } ]
    );
}

1;
