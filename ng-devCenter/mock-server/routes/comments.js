var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	res.json({
		status: true, 
		data: {
			comment: "<p>test add comment</p>", 
			raw_comment: "test add comment",
			id: "358843",
			key: "TS-1234",
			username: "tu1234",
			email: "tu1234@test.com",
			display_name: "User, Test (tu1234)",
			comment_type: "info",
			created: "2018-02-14T20:27:30.115+0000",
			updated: "2018-02-14T20:27:30.115+0000",
			isEditing: false, "closeText": "Edit Comment",
			editId: "E358843",
			visibility: "Developers"
		}
	});
});

router.put('/', function(req, res, next) {
	res.json({
		status: true, 
		data: {
			comment: "<p>test edit comment</p>", 
			raw_comment: "test edit comment",
			id: "358843",
			key: "TS-1234",
			username: "tu1234",
			email: "tu1234@test.com",
			display_name: "User, Test (tu1234)",
			comment_type: "info",
			created: "2018-02-14T20:27:30.115+0000",
			updated: "2018-02-14T20:27:30.115+0000",
			isEditing: false, "closeText": "Edit Comment",
			editId: "E358843",
			visibility: "Developers"
		}
	});
});

router.delete('/', function(req, res, next) {
	res.json(status:true});
});