let express = require('express');
let router = express.Router();

router.post('/crucible/create', function(req, res, next) {
	res.json({
		status: true, 
		data: {
			comment_response: {
				status: true,
				data: {
					comment: `<p style='color:red;'>${req.body.qa_steps}</p>`, 
					raw_comment: req.body.qa_steps, 
					id: "358850", 
					key: req.body.key, 
					username: "tu1234", 
					email: "tu1234@tu1234.com", 
					display_name: "User, Test (tu1234)", 
					comment_type: "info", 
					created: "2018-02-14T20:30:55.402+0000", 
					updated: "2018-02-14T20:30:55.402+0000", 
					isEditing: false, "closeText": "Edit Comment", 
					editId: "E358850", 
					visibility: "Developers"
				}
			},
			log_response: { status: true, data: 'error log_response' },
			cr_response: { status: true, data: 'error cr_response' }, 
			pcr_response: { status: true, data: 'error pcr_response' }, 
			cru_response: { status: true, data: "CR-TU-1234" }
		}
	})
});

module.exports = router;