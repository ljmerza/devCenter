let express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
	return res.json({
		status: true, 
		data: [
			{
				id: 1,
				type: "order",
				link: "order/New_York/1234",
				name: "1234 (1234)"
			}, 
			{
				id: 3,
				type: "order",
				link: "order/New_York/1234",
				name: "1234 (1234)"
			}, 
			{
				id: 21,
				type: "other_order",
				link: "order/New_York/test",
				name: "test"
			}, 
			{
				id: 22,
				type: "other_order",
				link: "order/New_York/testtest",
				name: "testtest"
			}, 
			{
				id: 28,
				type: "wfa",
				link: "group-lead?lead_ticket=test",
				name: "Group Ticket"
			}, 
			{
				id: 29,
				type: "wfa",
				link: "ticket/New_York/test",
				name: "test Ticket"
			}, 
			{
				id: 31,
				type: "prod_links",
				link: "http://test.com/test.pl",
				name: "UD2"
			}, 
			{
				id: 32,
				type: "prod_links",
				link: "http://test.com/test.pl",
				name: "test3"
			}, 
			{
				id: 39,
				type: "beta_links",
				link: "http://test.com/test.pl",
				name: "test3"
			}, 
			{
				id: 40,
				type: "beta_links",
				link: "test/cgi-bin/test.pl",
				name: "test"
			}, 
			{
				id: 49,
				type: "dev_links",
				link: "test/cgi-bin/test.pl",
				name: "test2"
			}, 
			{
				id: 50,
				type: "dev_links",
				link: "test/teams.php?ATTuid=##username##",
				name: "test"
			}, 
			{
				id: 51,
				type: "dev_links",
				link: "test/cgi-bin/test.pl",
				name: "test"
			}, 
			{
				id: 56,
				type: "ember_links",
				link: "asset/history",
				name: "Asset History"
			}, 
			{
				id: 57,
				type: "ember_links",
				link: "asset/inventory",
				name: "Asset Inventory"
			}, 
			{
				id: 58,
				type: "ember_links",
				link: "administration?attuid=##username##",
				name: "Admin Panel"
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
				link: "teams/000",
				name: "Edit Team"
			}, 
		]
	});
});

module.exports = router;