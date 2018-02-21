let express = require('express');
let router = express.Router();

router.get('/repo/:repoName', function(req, res, next) {
	res.json({
		status: true, 
		data: {
			crucible_id: "CR-UD-5464", 
			comment_response: {
				comment: "TEST", 
				raw_comment: "TEST", 
				id: "358850", 
				key: "UD-8699", 
				username: "lm240n", 
				email: "lm240n@att.com", 
				display_name: "Merza, Leo (lm240n)", 
				comment_type: "info", 
				created: "2018-02-14T20:30:55.402+0000", 
				updated: "2018-02-14T20:30:55.402+0000", 
				isEditing: false, "closeText": "Edit Comment", 
				editId: "E358850", 
				visibility: "Developers"
			},
			log_response: "",
			cr_response: "", 
			pcr_response: "", 
			cru_response: "CR-UD-5464"
		}
	})
});

module.exports = router;