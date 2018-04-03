#!/usr/bin/perl

use strict;
use warnings;

BEGIN {
	use lib ( "/opt/@{[ ( getpwuid($<) )[0] ]}/includes", "/opt/includes/DTI", "/opt/includes");
}

binmode STDOUT, ":utf8";
use utf8;
use JSON;
use File::Path qw(make_path);
use Hash::Merge qw( merge );
use M5::DB;
use Data::Dumper;

# Hash::Merge::set_behavior('RETAINMENT_PRECEDENT');
Hash::Merge::set_behavior('LEFT_PRECEDENT');


my $dirname = 'data';
my $output = "$dirname/data_outs.json";
make_path($dirname, {chmod => 0777});

my $number_of_orders = '1000';

my @sqls = (
	 {table => 'CANOPI_UNIPO_UNITO', order_field => 'CKTID_PARSE', db_field => 'UNI_CKTID_PARSE'},
	 {table => 'CANOPI_UNItoEVCMap', order_field => 'CKTID_PARSE', db_field => 'UNI_CKTID_Parse'},
	 {table => 'CANOPI_UNIPO_CNLTO', order_field => 'CKTID_PARSE', db_field => 'UNI_CKTID_PARSE'},
	 {table => 'CANOPI_UNItoCNLMap', order_field => 'CNL_CKTID_PARSE', db_field => 'CNL_CKTID_PARSE'},

	 {table => 'NTE_2_MINCNL', order_field => 'CNL_CKTID_PARSE', db_field => 'CNL_CKTID_PARSE'},
	 
	 {table => 'ATX_Match', order_field => 'ATX_USO', db_field => 'USO'},
	 {table => 'ASEdb_bettc_database_MATCH', order_field => 'ASEdb_SiteID', db_field => 'Site_ID'},
	 {table => 'IMEPAS_T_EPAS_EXACT_ASC', order_field => 'PON', db_field => 'PON'},

	 {table => 'IOS_Orders', order_field => 'mcn', db_field => 'mcn'},

	 {table => 'FORCE_enocDSP', order_field => 'OrdNum', db_field => 'ORD'},
	 {table => 'AUTOLOADER_EVC', order_field => 'trk', db_field => 'UNI_TRK'},
);

sub db_connect_odb_ro {
	my ($class) = @_;
	return M5::DB->connect(
		db => 'odb',
		mode => 'read',
		use_prod => 1
	);
}


my $dbh = db_connect_odb_ro();

my $sql = ";
SELECT TOP $number_of_orders *
FROM ODB.dbo.CORE_ENOC1CENTER_DB2 as Core 
right join odb.dbo.DB2_Feeds_Refresh as Refresh 
on Core.cktid = Refresh.cktid and Core.event_type = Refresh.event_type 
AND Refresh.cmp_dt is NULL";

my $sth = $dbh->prepare($sql);
$sth->execute();
my $order_data = $sth->fetchall_arrayref({});

foreach my $query_object (@sqls){

	my $table = $query_object->{table};
	my $order_field = $query_object->{order_field};
	my $db_field = $query_object->{db_field};

	my @field_values = ();
	foreach my $order (@{$order_data}){
		if($order->{$order_field}){
			my $value = $order->{$order_field} ;
			push @field_values, $value;
		}
	}

	print "$table ";
	my $sql_query = "SELECT * FROM odb.dbo.$table WHERE $db_field IN (\'@{[ join('\',\'', @field_values) ]}\')";

	my $sth = $dbh->prepare($sql_query);
	$sth->execute();
	my $db_data = $sth->fetchall_arrayref({});

	$order_data = merge_orders(
		order_data => $order_data, 
		db_data => $db_data, 
		table => $table
	);
}


# create JSON dump
open my $fh, ">", $output or die "Cannot open file '$output': $!\n";
print $fh encode_json($order_data);
close $fh;


$sth->finish;
$dbh->disconnect;

sub merge_orders {
	my (%args) = @_;

	my $order_data = $args{order_data}; 
	my $db_data = $args{db_data}; 
	my $table = $args{table};

	my $hasMerged = 0;

	foreach my $order (@{$order_data}){
		foreach my $row (@{$db_data}){

			foreach my $field (keys %{$row}){
				$hasMerged = 1;

				my $parsed_field = $field;
				$parsed_field =~ s/\ /_/g;

				$order->{$table.'__'.$parsed_field} = $row->{$field};
			}
		}
	}

	print $hasMerged ? "merged\n" : "not merged\n";
	return $order_data;
}