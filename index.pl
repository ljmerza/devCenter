#!/usr/bin/perl
use CGI;
my $cgi = CGI::new();
print $cgi->redirect('cgi-bin/index.pl');