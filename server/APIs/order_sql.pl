#!/usr/bin/perl

use strict;
use warnings;

BEGIN {
	use lib ( "/opt/@{[ ( getpwuid($<) )[0] ]}/includes", "/opt/includes/DTI", "/opt/includes");
}

binmode STDOUT, ":utf8";
use utf8;
use JSON;
use Hash::Merge qw( merge );
use M5::DB;
use Data::Dumper;

# keep all values when merging history results
Hash::Merge::set_behavior('RETAINMENT_PRECEDENT');


sub db_connect_odb_ro {
	my ($class) = @_;
	return M5::DB->connect(
		db => 'odb',
		mode => 'read',
		use_prod => 1
	);
}



my $dbh = db_connect_odb_ro();

my $base_sql = 'SELECT TOP 1000 * FROM odb.dbo.';
my $sqls ={
	CANOPI_UNIPO_CNLTO => {order_field => 'CNL_CKTID_PARSE', db_field => 'CNL_CKTID_PARSE'},
	CANOPI_UNIPO_UNITO => {order_field => 'CNL_CKTID_PARSE', db_field => 'CNL_CKTID_PARSE'},
	NTE_2_MINCNL => {order_field => 'CNL_CKTID_PARSE', db_field => 'CNL_CKTID_PARSE'},
	ATX_Match => {order_field => 'ATX_USO', db_field => 'USO'},
	IOS_Orders => {order_field => 'ATX_USO', db_field => 'USO'},

	IMEPAS_T_EPAS_EXACT_ASC => {order_field => 'PON', db_field => 'PON'},
	ASEdb_bettc_database_MATCH => {order_field => 'ASEdb_SiteID', db_field => 'Site_ID'},
	FORCE_enocDSP => {order_field => 'cktid', db_field => 'CIRCUIT_ID'},
	CANOPI_UNItoEVCMap => {order_field => 'UNI_CKTID_PARSE', db_field => 'UNI_CKTID_PARSE'},

	AUTOLOADER_EVC => {order_field => 'cktid', db_field => 'EVC_CKTID'},
};


my $sql = <<'SQL';
SELECT TOP 1000 *
FROM ODB.dbo.CORE_ENOC1CENTER_DB2 as Core 
right join odb.dbo.DB2_Feeds_Refresh as Refresh 
on Core.cktid = Refresh.cktid and Core.event_type = Refresh.event_type 
AND Refresh.cmp_dt is NULL;
SQL

my $sth = $dbh->prepare($sql);
$sth->execute();
my $order_data =  $sth->fetchall_arrayref({});


foreach my $data_base (keys %{$sqls}){

	my $query_object = $sqls->{$data_base};
	my $sql_query = $base_sql . $data_base;

	my $order_field = $query_object->{order_field};
	my $db_field = $query_object->{db_field} || $query_object->{order_field};

	$sth = $dbh->prepare($sql_query);
	$sth->execute();
	my $db_data = $sth->fetchall_arrayref({});
	$order_data = merge_orders(
		order_data => $order_data, 
		db_data => $db_data, 
		order_field => $order_field, 
		db_field => $db_field
	);
}


open my $fh, ">", "data_out.json";
print $fh encode_json($order_data);
close $fh;


$sth->finish;
$dbh->disconnect;

sub merge_orders {
	my (%args) = @_;

	my $order_data = $args{order_data}; 
	my $db_data = $args{db_data}; 
	my $order_field = $args{order_field}; 
	my $db_field = $args{db_field};

	foreach my $order (@{$order_data}){
		foreach my $row (@{$db_data}){
			if($order->{$order_field} and $row->{$db_field} and $order->{$order_field} eq $row->{$db_field}){
				$order = \%{ merge( $order, $row ) };
			}
		}
	}

	return $order_data;
}