#!/usr/bin/env perl

#Sets up environment.
use Net::SMTP;
use MIME::Lite;

#Sets up variables.
my $to = 'aschmidt34@wisc.edu';
my $from = 'ehr-no-not-reply@primate.wisc.edu';
my $subject = 'Test subject.';
my $message = 'Test message.';

#Creates message.
my $smtp = MIME::Lite->new(
    To      => $to,
    From    => $from,
    Subject => $subject,
    Type    => 'multipart/alternative'
);

#Adds data to message.
$smtp->attach(
    Encoding    => 'quoted-printable',
    Data        => $message
);

#Sends message.
$smtp->send();