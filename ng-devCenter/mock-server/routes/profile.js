var express = require('express');
var router = express.Router();

router.get('/:username', function(req, res, next) {
	return res.json({
		status: true, 
		data: {
			self: "rest/api/2/user?username=tu1234",
			key: "tu1234", 
			name: "tu1234", 
			"emailAddress": "tu1234@att.com", 
			"avatar": "secure/useravatar?ownerId=tu1234", 
			"displayName": "User, tu1234 (tu1234)", 
			"timeZone": "America/New_York",  
			"ping_settings": {
				"username": "tu1234", 
				"all_ping": "0", 
				"new_ping": "0", 
				"conflict_ping": "0",
				"cr_fail_ping": "0", 
				"uct_fail_ping": "0", 
				"merge_ping": "0", 
				"never_ping": "0", 
				"qa_fail_ping": "0"
			}
		}
	})
});



module.exports = router;
