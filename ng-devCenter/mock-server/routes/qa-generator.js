let express = require('express');
let router = express.Router();




router.post('/crucible/create', function(req, res, next) {

	// get all request body data
	const qaSteps = !!req.body.qa_steps;
	const logTime = req.body.log_time > 0;
	const autoPCR = req.body.autoPCR;
	const repos = req.body.repos.length > 0;

	// get overall response status
	const responseStatus = qaSteps || logTime || autoPCR || repos;

	// create comment
	const comment = {
		comment: `<p style='color:red;'>${req.body.qa_steps}</p>`, 
		raw_comment: req.body.qa_steps, 
		id: '358850', 
		key: req.body.key, 
		username: 'tu1234', 
		email: 'tu1234@tu1234.com', 
		display_name: 'User, Test (tu1234)', 
		comment_type: 'info', 
		created: '2018-02-14T20:30:55.402+0000', 
		updated: '2018-02-14T20:30:55.402+0000', 
		isEditing: false, 'closeText': 'Edit Comment', 
		editId: 'E358850', 
		visibility: 'Developers'
	};

	// send response
	res.json({
		status: responseStatus, 
		data: {
			comment_response: { status: qaSteps, data: qaSteps ? comment : 'error log_response' },
			log_response: { status: logTime, data: 'error log_response' },
			cr_response: { status: autoPCR, data: 'error cr_response' }, 
			pcr_response: { status: autoPCR, data: 'error pcr_response' }, 
			cru_response: { status: repos, data: repos ? 'CR-TU-1234' : 'error cru_response'}
		}
	})
});

module.exports = router;