let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
	return res.json({
		status: true, 
		data: [
			{
				id: 1,
				type: "order",
				link: "order/ethernet/GAS544770001",
				name: "GAS544770001 (EAN)"
			}, 
			{
				id: 3,
				type: "order",
				link: "order/ethernet/OKS433527001",
				name: "OKS433527001 (Word Doc)"
			}, 
			{
				id: 4,
				type: "order",
				link: "order/ethernet/HOC574865001",
				name: "HOC574865001 (Juniper)"
			}, 
			{
				id: 5,
				type: "order",
				link: "order/ethernet/BAS539606001",
				name: "BAS539606001 (Inventory)"
			}, 
			{
				id: 6,
				type: "order",
				link: "order/ethernet/MIS140524001",
				name: "MIS140524001 (CTH)"
			}, 
			{
				id: 7,
				type: "order",
				link: "order/ethernet/NCC326168001",
				name: "NCC326168001 (EVC)"
			}, 
			{
				id: 8,
				type: "order",
				link: "order/ethernet/WTS252430001",
				name: "WTS252430001 (Canopi)"
			}, 
			{
				id: 9,
				type: "order",
				link: "order/ethernet/DLS186977001",
				name: "DLS186977001 (Force/Edge)"
			}, 
			{
				id: 10,
				type: "order",
				link: "order/ethernet/SWC246312001",
				name: "SWC246312001 (xlata)"
			}, 
			{
				id: 11,
				type: "order",
				link: "order/ethernet/LBS065263001",
				name: "LBS065263001 (EvcMultiPointSit"
			}, 
			{
				id: 12,
				type: "order",
				link: "order/ethernet/NFS244485001",
				name: "NFS244485001 (EVC P2P)"
			}, 
			{
				id: 13,
				type: "order",
				link: "order/ethernet/WTS252804001",
				name: "WTS252804001 (multi-evc)"
			}, 
			{
				id: 14,
				type: "order",
				link: "order/ethernet/ORC338494001",
				name: "ORC338494001 (timeline)"
			}, 
			{
				id: 15,
				type: "order",
				link: "order/ethernet/SAS118018001",
				name: "SAS118018001 (OSSCN)"
			}, 
			{
				id: 16,
				type: "order",
				link: "order/ethernet/ARC167777001",
				name: "ARC167777001 (EXACT)"
			}, 
			{
				id: 17,
				type: "order",
				link: "order/ethernet/LAS899407001",
				name: "LAS899407001 (RDS Tracking ID)"
			}, 
			{
				id: 18,
				type: "order",
				link: "order/ethernet/KYS015215001",
				name: "KYS015215001 (ASEdb)"
			}, 
			{
				id: 19,
				type: "order",
				link: "order/ethernet/LAS363194001",
				name: "LAS363194001 (EFMS)"
			}, 
			{
				id: 20,
				type: "order",
				link: "order/ethernet/SES149155001",
				name: "SES149155001 (OSSOI Data)"
			}, 
			{
				id: 21,
				type: "other_order",
				link: "order/ethernet/SLS817036001",
				name: "SLS817036001"
			}, 
			{
				id: 22,
				type: "other_order",
				link: "order/ethernet/SWS230192001",
				name: "SWS230192001"
			}, 
			{
				id: 23,
				type: "other_order",
				link: "order/ethernet/SFS016277001",
				name: "SFS016277001"
			}, 
			{
				id: 24,
				type: "other_order",
				link: "order/ethernet/NOS193664001",
				name: "NOS193664001"
			}, 
			{
				id: 25,
				type: "other_order",
				link: "order/ethernet/LBS065460001",
				name: "LBS065460001"
			}, 
			{
				id: 26,
				type: "other_order",
				link: "order/ethernet/TNS268897001",
				name: "TNS268897001"
			}, 
			{
				id: 27,
				type: "order",
				link: "order/ethernet/NES233998001",
				name: "NES233998001 (multi EVC PO)"
			}, 
			{
				id: 28,
				type: "wfa",
				link: "group-lead?lead_ticket=WTXIV000724",
				name: "Group Ticket"
			}, 
			{
				id: 29,
				type: "wfa",
				link: "ticket/ethernet/WTXIV000892",
				name: "WFA Ticket"
			}, 
			{
				id: 30,
				type: "wfa",
				link: "ticket/ethernet/WILTP177929",
				name: "Referrals"
			}, 
			{
				id: 31,
				type: "prod_links",
				link: "http://ud.web.att.com/UD/cgi-bin/worklist.pl",
				name: "UD"
			}, 
			{
				id: 32,
				type: "prod_links",
				link: "http://aqe.web.att.com/aqe/cgi-bin/index.pl",
				name: "AQE"
			}, 
			{
				id: 33,
				type: "prod_links",
				link: "http://teamdb.web.att.com/teamdb/teams.php?ATTuid=##username##",
				name: "TeamDB"
			}, 
			{
				id: 34,
				type: "prod_links",
				link: "http://wam.web.att.com/wam/cgi-bin/wam.pl",
				name: "WAM"
			}, 
			{
				id: 35,
				type: "prod_links",
				link: "http://gcs-upm.web.att.com/upm2/access.php",
				name: "UPM"
			}, 
			{
				id: 36,
				type: "prod_links",
				link: "http://gcs-templates.web.att.com/Templates/cgi-bin/Template.pl",
				name: "Template Tool"
			}, 
			{
				id: 37,
				type: "prod_links",
				link: "http://chrapud09b.gcsc.att.com/tqi3/cgi-bin/",
				name: "TQI"
			}, 
			{
				id: 38,
				type: "prod_links",
				link: "http://chrapud09b.gcsc.att.com/critdb/alerts.php",
				name: "Critical Watch"
			}, 
			{
				id: 39,
				type: "beta_links",
				link: "http://ud-beta.web.att.com/UD/cgi-bin/worklist.pl",
				name: "UD"
			}, 
			{
				id: 40,
				type: "beta_links",
				link: "aqe/cgi-bin/index.pl",
				name: "AQE"
			}, 
			{
				id: 41,
				type: "beta_links",
				link: "teamdb/teams.php?ATTuid=##username##",
				name: "TeamDB"
			}, 
			{
				id: 42,
				type: "beta_links",
				link: "wam/cgi-bin/wam.pl",
				name: "WAM"
			}, 
			{
				id: 43,
				type: "beta_links",
				link: "upm2/access.php",
				name: "UPM"
			}, 
			{
				id: 44,
				type: "beta_links",
				link: "Templates/cgi-bin/Template.pl",
				name: "Template Tool"
			}, 
			{
				id: 45,
				type: "beta_links",
				link: "tqi3/cgi-bin/index.pl",
				name: "TQI"
			}, 
			{
				id: 46,
				type: "beta_links",
				link: "http://chrapud22.gcsc.att.com:4040/order/gps/cr/149686",
				name: "UD_api"
			}, 
			{
				id: 47,
				type: "beta_links",
				link: "http://ud-beta.web.att.com/UD-ember/#/ticket/ether",
				name: "UD ember"
			}, 
			{
				id: 48,
				type: "beta_links",
				link: "http://chrapud16b.gcsc.att.com/teamdbgui/",
				name: "TeamDB ember"
			}, 
			{
				id: 49,
				type: "dev_links",
				link: "aqe/cgi-bin/index.pl",
				name: "AQE"
			}, 
			{
				id: 50,
				type: "dev_links",
				link: "teamdb/teams.php?ATTuid=##username##",
				name: "TeamDB"
			}, 
			{
				id: 51,
				type: "dev_links",
				link: "wam/cgi-bin/wam.pl",
				name: "WAM"
			}, 
			{
				id: 52,
				type: "dev_links",
				link: "upm/app.php",
				name: "UPM"
			}, 
			{
				id: 53,
				type: "dev_links",
				link: "Templates/cgi-bin/Template.pl",
				name: "Template Tool"
			}, 
			{
				id: 54,
				type: "dev_links",
				link: "UD/cgi-bin/worklist.pl",
				name: "UD"
			}, 
			{
				id: 55,
				type: "dev_links",
				link: "tqi3/cgi-bin/",
				name: "TQI"
			}, 
			{
				id: 56,
				type: "ember_links",
				link: "asset/history?asset=TEST&UAT=0&usertimezone=America/New_York&usertimeformat=12HR",
				name: "Asset History"
			}, 
			{
				id: 57,
				type: "ember_links",
				link: "asset/inventory?asset=TEST&UAT=0&usertimezone=America/New_York&usertimeformat=12HR",
				name: "Asset Inventory"
			}, 
			{
				id: 58,
				type: "ember_links",
				link: "administration?attuid=##username##",
				name: "Admin Panel"
			}, 
			{
				id: 59,
				type: "ember_links",
				link: "order/bmp/7O2402151",
				name: "BMP Ticket"
			}, 
			{
				id: 60,
				type: "ember_links",
				link: "order/eld/BAS539606001",
				name: "ELD"
			}, 
			{
				id: 61,
				type: "ember_links",
				link: "ticketing-system/aots/advanced-search",
				name: "AOTS Advanced Search"
			}, 
			{
				id: 62,
				type: "ember_links",
				link: "worklist",
				name: "Worklist"
			}, 
			{
				id: 63,
				type: "ember_links",
				link: "task/backup-restore/123",
				name: "Backup Restore"
			}, 
			{
				id: 64,
				type: "ember_links",
				link: "task/backup-request/123",
				name: "Backup Request"
			}, 
			{
				id: 65,
				type: "ember_links",
				link: "task/backup-validation/123",
				name: "Backup Validation"
			}, 
			{
				id: 66,
				type: "ember_links",
				link: "order/rds/11301788850496TE",
				name: "RDS"
			}, 
			{
				id: 67,
				type: "ember_links",
				link: "order/asedb/11301788850496TE",
				name: "ASE DB"
			}, 
			{
				id: 68,
				type: "ember_links",
				link: "logs/7O2402151",
				name: "Ticket Logs"
			}, 
			{
				id: 69,
				type: "ember_links",
				link: "order/client-request/7O2402151",
				name: "Client-Request"
			}, 
			{
				id: 70,
				type: "ember_links",
				link: "development/components/rome",
				name: "ROME"
			}, 
			{
				id: 71,
				type: "ember_links",
				link: "development/rds-data",
				name: "RDS-Data"
			}, 
			{
				id: 72,
				type: "ember_links",
				link: "splash-images/edit/1",
				name: "Splash-Images"
			}, 
			{
				id: 73,
				type: "order",
				link: "order/ethernet/BAS539606001",
				name: "BAS539606001 (OMX/OCX)"
			}, 
			{
				id: 78,
				type: "teamdb_ember",
				link: "teams",
				name: "Teams"
			}, 
			{
				id: 79,
				type: "teamdb_ember",
				link: "teams/227",
				name: "Edit Team"
			}, 
			{
				id: 80,
				type: "teamdb_ember",
				link: "users/##username##",
				name: "Edit Profile"
			}, 
			{
				id: 81,
				type: "teamdb_ember",
				link: "workgroup",
				name: "Workgroup"
			}
		]
	});
});

module.exports = router;