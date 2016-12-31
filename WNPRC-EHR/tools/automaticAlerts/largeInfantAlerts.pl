#!/usr/bin/perl -w


# Selection query


use strict;
use Labkey::Query;
use Time::localtime;
use Net::SMTP;
use MIME::Lite;


# Create string for currentDate
        my $tm = localtime;
my $dateString = sprintf("%04d-%02d-%02d at %02d:%02d", $tm->year+1900, ($tm->mon)+1, $tm->mday, $tm->hour, $tm->min);

# Opening line of alert's message
my $email_html = "This email lists orphans assigned to cages that do not meet minimum size requirements as of $dateString.<p>";
my $results;
my $mail_server = 'smtp.primate.wisc.edu';
my $from = 'ehr-do-not-reply@primate.wisc.edu';


my $baseUrl='https://ehr.primate.wisc.edu/';
my $default_container='/WNPRC/EHR/';
my $dataExists = 0;
getHeavyInfants();
if ($dataExists) {
    sendEmail();
}
sub getHeavyInfants {
    $results = Labkey::Query::selectRows(
            -baseUrl => $baseUrl,
            -containerPath => $default_container,
            -schemaName => 'study',
            -queryName => 'InfantsWithExcessWeight',
            -requiredVersion => 8.3,
);
    if (@{$results->{rows}}){
        $dataExists = 1;
        if (@{$results->{rows}} > 1) {
            $email_html .= "<b>WARNING: There are " .@{$results->{rows}}. " orphans under the age of 6 months residing in cages that do not accommodate the animals's size. </b><br>";
        } else {
            $email_html .= "<b>WARNING: There is " .@{$results->{rows}}. " orphan under the age of 6 months residing in a cage that does not accommodate the animals's size. </b><br>";
        }

        $email_html .= "<br><br>";
        $email_html .= "<u>Animal</u><br>";
        foreach my $row (@{$results->{rows}}) {
            $email_html .= $$row{'id'};
			#$email_html .= "\t";
			#$email_html .= $$row{'Room'};
			#$email_html .= "-";
			#$email_html .= $$row{'cage'};
            $email_html .= "<br>";
        }
        $email_html .= "<br><br>";

        $email_html .= "<p><a href='".$baseUrl."query/".$default_container."executeQuery.view?schemaName=study&queryName=InfantsWithExcessWeight&"."'>Click here to view them</a></p>";
        $email_html .= '<hr>';
    }

}
sub sendEmail {
    my @email_recipients = [ "friscino\@primate.wisc.edu", "frost\@primate.wisc.edu" ] ;
    my $smtp = MIME::Lite->new(
		#To 	=>join(", ", @email_recipients),
            To 	=>'friscino@primate.wisc.edu, frost@primate.wisc.edu',
            From	=>$from,
            Subject =>"Subject: Orphans Not in Compliant Cage Alert on $dateString",
            Type	=>'multipart/alternative'
);
    $smtp->attach(Type	=> 'text/html',
            Encoding	=> 'quoted-printable',
            Data		=> $email_html
);
    $smtp->send() || die;
}
