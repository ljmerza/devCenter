var express = require('express');
var router = express.Router();

router.get('/jira/profile/:username', function(req, res, next) {
	return res.json({
		status: true, 
		data: {
			self: "http://jira.web.att.com/rest/api/2/user?username=lm240n",
			key: "lm240n", 
			name: "lm240n", 
			"emailAddress": "lm240n@att.com", 
			"avatarUrls": {
				"48x48": "http://jira.web.att.com/secure/useravatar?ownerId=lm240n&avatarId=11051", 
				"24x24": "http://jira.web.att.com/secure/useravatar?size=small&ownerId=lm240n&avatarId=11051", 
				"16x16": "http://jira.web.att.com/secure/useravatar?size=xsmall&ownerId=lm240n&avatarId=11051", 
				"32x32": "http://jira.web.att.com/secure/useravatar?size=medium&ownerId=lm240n&avatarId=11051"
			}, 
			"displayName": "Merza, Leo (lm240n)", 
			"active": true, 
			"timeZone": "America/New_York", 
			"locale": "en_US", 
			"groups": {
				"size": 1, 
				"items": []
			}, 
			"applicationRoles": {
				"size": 1,
				 "items": []
			}, 
			"expand": "groups,applicationRoles", 
			"ping_settings": {
				"username": "lm240n", 
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
