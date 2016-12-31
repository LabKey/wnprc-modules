#!/usr/bin/env perl

# This script is meant to help viewing SQL queries, by adding new lines and indentation
# for readability.  This is especially useful when debugging queries in Java, where the
# query text is obtained from the debug menu.
#
# This isn't perfect.  Sometimes it adds extra lines, and it doesn't handle string values
# all that well; it was just a quick script.
#
# Ex:
# "SELECT * FROM ( SELECT * FROM demographics a )" ==> SELECT *
#                                                      FROM (
#                                                         SELECT *
#                                                         FROM demographics
#                                                      )
#
# Usage:
#   cat sql-query.txt | ./format-sql.pl [-v]
#
# The "-v" flag tells the script to replace tabs with "|.." to make multiple levels a
# little easier to distinguish.

use Getopt::Long;

my $verbose = '';
GetOptions( "verbose" => \$verbose );

my @input = <STDIN>;

@lines = map { s/--(.*)$//g; $_; } @input;

my $sql_text = join("", @lines);

$sql_text =~ s/\)/ ) /g;
$sql_text =~ s/\(/ ( /g;
$sql_text =~ s/\s+/ /g;

my @words = split(" ", $sql_text);

my $indent = 0;
$sql_text = "";

my $get_indent = sub {
	#print "\nindent: $indent \n";
	return "" . ("\t" x $indent);
};

my $get_newline = sub {
	return "\n" . $get_indent->();
};

for my $word (@words) {
	#print "$word\n";
	#next;
	if ($word =~ /^SELECT|FROM|WHERE|ON$/i) {
		#print "Found word: $word\n";
		$sql_text .= $get_newline->() . "$word ";
		if ($word =~ /^SELECT$/i) {
			$sql_text .= $get_newline->();
		}
	}
	elsif ($word =~ /^\(|CASE$/i) {
		#print "Found open paren: $word\n";
		#print "\nincrementing indent\n";
		$indent += 1;
		$sql_text .= "$word" . $get_newline->();
	}
	elsif ($word =~ /^\)|END$/i) {
		#print "Found closing paren: $word\n";
		#print "\ndecrementing indent\n";
		$indent -= 1;
		$sql_text .= $get_newline->() . "$word" . $get_newline->();
	}
	else {
		#print "Found other: $word\n";
		$sql_text .= "$word ";
		if ($word =~ /,$/) {
			$sql_text .= $get_newline->();
		}
	}
}

my $sql_text = join("\n", grep { $_ !~ /^((\|..)|\s)*$/ } (split("\n", $sql_text)));

# Remove any trailing spaces
$sql_text =~ s/ +\n/\n/g;

# Ensure that JOINs get their own line
$sql_text =~ s/(?<indent>\t*)(?<otherstuff>.*?)(?<join>((LEFT|RIGHT) )?((OUTER|INNER) )?JOIN)(?<last>.*)/$+{indent}$+{otherstuff}\n$+{indent}\n$+{indent}$+{join}$+{last}/ig;

# This is supposed to inline the name of a subquery, but it doesn't seem to work well:
#   SELECT (       => SELECT (
#      SELECT      =>    SELECT
#      *           =>    *
#      FROM table  =>    FROM table
#   )              => ) new_table
#   new_table      =>
$sql_text =~ s/\)\n\t*(?<word>(AS )?[a-zA-Z_0-9.]+) ?\n/) $+{word}\n/ig;

# Inline "SELECT *"
$sql_text =~ s/SELECT\s*\*/SELECT */ig;

# Replace the tabs with a more readable prefix.  Note that this will make it syntactically incorrect.
if ($verbose) {
    $sql_text =~ s/\t/|../g;
}
else {
    $sql_text =~ s/\t/   /g;
}


print( $sql_text . "\n" );


