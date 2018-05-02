let express = require('express');
let router = express.Router();

router.post('/', function(req, res, next) {

	res.json({
		status: true, 
		data: {
			comment_response: {
				data: {
					comment: `<p>${req.body.comment}</p>`, 
					raw_comment: req.body.comment,
					id: "898944",
					key: req.body.key,
					username: "tu1234",
					email: "tu1234@test.com",
					display_name: "User, Test (tu1234)",
					comment_type: "info",
					created: "2025-02-14T20:27:30.115+0000",
					updated: "2025-02-14T20:27:30.115+0000",
					isEditing: false, 
					closeText: "Edit Comment",
					editId: "E358843",
					visibility: "Developers"
				},
				status: true
			},
			log_response: {
				status: !!req.body.log_time
			},
			conflict_response: {
				status: req.body.remove_conflict
			},
			merge_response: {
				status: req.body.remove_merge
			}
		}
	});
});

router.put('/', function(req, res, next) {
	res.json({
		status: true, 
		data: {
			comment: `<p>${req.body.comment}</p>`, 
			raw_comment: req.body.comment,
			id: req.body.comment_id,
			key: req.body.key,
			username: "tu1234",
			email: "tu1234@test.com",
			display_name: "User, Test (tu1234)",
			comment_type: "info",
			created: "2025-02-14T20:27:30.115+0000",
			updated: "2025-02-14T20:27:30.115+0000",
			isEditing: false, 
			closeText: "Edit Comment",
			editId: "E358843",
			visibility: "Developers"
		}
	});
});

router.delete('/', function(req, res, next) {
	res.json({status:true});
});

module.exports = router;