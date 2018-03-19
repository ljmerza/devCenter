#!/usr/bin/perl

use strict;
use warnings;

binmode STDOUT, ":utf8";
use utf8;
use JSON;

BEGIN {
	use lib ( "/opt/@{[ ( getpwuid($<) )[0] ]}/includes", "/opt/includes/DTI", "/opt/includes");
}


use M5::DB;
use Data::Dumper;


sub db_connect_odb_ro {
	my ($class) = @_;
	
	return M5::DB->connect(
		db => 'odb',
		mode => 'read',
		use_prod => 1
	);
}

my $dbh = db_connect_odb_ro();

my $sql = <<'SQL';
SELECT *

FROM ODB.dbo.CORE_ENOC1CENTER_DB2 as Core 

right join odb.dbo.DB2_Feeds_Refresh as Refresh 
on Core.cktid = Refresh.cktid and Core.event_type = Refresh.event_type 

right join odb.dbo.CANOPI_UNIPO_CNLTO as CNL 
on Core.CNL_CKTID_PARSE = CNL.CNL_CKTID_PARSE

right join odb.dbo.CANOPI_UNIPO_UNITO as UNI 
on Core.CNL_CKTID_PARSE = UNI.CNL_CKTID_PARSE

left join odb.dbo.NTE_2_MINCNL as NTE 
on Core.CNL_CKTID_PARSE = NTE.CNL_CKTID_PARSE

left join ODB.dbo.ATX_Match as ATX 
on Core.ATX_USO = ATX.USO

left join ODB.dbo.IOS_Orders as ISO 
on Core.ATX_USO = ISO.USO

left join ODB.dbo.IMEPAS_T_EPAS_EXACT_ASC as EXACT 
on EXACT.PON = Refresh.PON

left join ODB.dbo.ASEdb_bettc_database_MATCH as ASR 
on ASR.Site_ID = Core.ASEdb_SiteID

left join ODB.dbo.FORCE_enocDSP as FORCE 
on FORCE.CIRCUIT_ID = Core.cktid

left join ODB.dbo.CANOPI_UNItoEVCMap as EVC_MAP 
on CNL.UNI_CKTID_PARSE = EVC_MAP.UNI_CKTID_PARSE

WHERE Refresh.pos='2TZ' AND Refresh.cmp_dt is NULL
SQL

my @retArr;
my $sth = $dbh->prepare($sql);
$sth->execute();

while (my $row = $sth->fetchrow_hashref()) {
	push(@retArr, $row);
}


open my $fh, ">", "data_out.json";
print $fh encode_json(\@retArr);
close $fh;


$sth->finish;
$dbh->disconnect;