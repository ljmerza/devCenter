let express = require('express');
let router = express.Router();

router.get('/tickets', function(req, res, next) {
	res.json({
		total_tickets: 4, 
		data: [
			{
				"key": "TS-1234", 
				"msrp": "1029386", 
				"user_details": {
					"username": "testuser", 
					"email_address": "testuser@test.com", 
					"display_name": "User, Test"
				}, 
				"username": "testuser", 
				"customer_details": {
					"username": "tu1234", 
					"email": "tu1234@test.com", 
					"display_name": "LASTNAME TEST", 
					"phone_number": "null"
				}, "dates": {
					"estimate": "3d", 
					"logged": "", 
					"logged_seconds": "3600", 
					"duedate": "2018-01-10", 
					"created": "2017-12-27T20:36:38.000+0000", 
					"updated": "2018-01-02T21:16:29.000+0000", 
					"started": "2018-01-08"
				}, 
				"crucible_id": "TS-37554", 
				"summary": "This is a summary", 
				"component": "", 
				"status": "In QA", 
				"story_point": 3, 
				"sprint": "4.02", 
				"epic_link": "TS-1234", 
				"label": "LABELS", 
				"comments": [
					{
						"comment": "<p>This is the first comment</p>",
						"raw_comment": "This is the first comment",
						"id": "321438", 
						"key": "TS-1234", 
						"username": "tu1234", 
						"email": "tu1234@test.com", 
						"display_name": "TEST, TEST (tu1234)", 
						"comment_type": "info", 
						"created": "2017-12-27T20:36:41.633+0000", 
						"updated": "2017-12-27T20:38:10.067+0000", 
						"visibility": ""
					}
				], 
				"qa_steps": "", 
				"attachments": [
					{
						"filename": "screenshot-1.png", 
						"link": "http://jira.web.test.com/secure/attachment/42100/screenshot-1.png"
					}
				], 
				"watchers": [
					{
						"username": "tu0483", 
						"displayName": "JIRA mech ID"
					}, 
					{
						"username": "tu1234", 
						"displayName": "TEST, TEST"
					}
				], 
				"priority": "Minor", 
				"severity": "Severity 3", 
				"code_reviewer": {
					"username": "tu1234", 
					"displayName": "TEST, TEST"
				}, 
				"issue_type": "Story", 
				"environment": "env testing", 
				"links": [
					{
						"id": "51042", 
						"self": "http://jira.web.test.com/rest/api/2/issueLink/51042", 
						"type": {
							"id": "10000", 
							"name": "Blocks", 
							"inward": "is blocked by", 
							"outward": "blocks", 
							"self": "http://jira.web.test.com/rest/api/2/issueLinkType/10000"
						}, 
						"inwardIssue": {
							"id": "89473", 
							"key": "TS-7795", 
							"self": "http://jira.web.test.com/rest/api/2/issue/89473", 
							"fields": {
								"summary": "summary of another ticket", 
								"status": {
									"self": "http://jira.web.test.com/rest/api/2/status/10105",
									 "description": "", 
									 "iconUrl": "http://jira.web.test.com/images/icons/statuses/generic.png", 
									 "name": "In Development", 
									 "id": "10105", 
									 "statusCategory": {
									 	"self": "http://jira.web.test.com/rest/api/2/statuscategory/4", 
									 	"id": 4, 
									 	"key": "indeterminate", 
									 	"colorName": "yellow", 
									 	"name": "In Progress"
									}
								}, 
								"priority": {
									"self": "http://jira.web.test.com/rest/api/2/priority/7", 
									"iconUrl": "http://jira.web.test.com/images/icons/priorities/lowest.svg", 
									"name": "Minor", 
									"id": "7"
								}, 
								"issuetype": {
									"self": "http://jira.web.test.com/rest/api/2/issuetype/10001", 
									"id": "10001", 
									"description": "jira issue number", 
									"iconUrl": "http://jira.web.test.com/images/icons/issuetypes/story.svg", 
									"name": "Story", 
									"subtask": false
								}
							}
						}
					}
				], 
				"commit": "[TS-1234] Ticket #1029386 This is a summary", 
				"branch": "testuser-1029386-branch-testing"
			},
			{
				"key": "TS-1235", 
				"msrp": "1029386", 
				"user_details": {
					"username": "testuser", 
					"email_address": "testuser@test.com", 
					"display_name": "User, Test"
				}, 
				"username": "testuser", 
				"customer_details": {
					"username": "tu1234", 
					"email": "tu1234@test.com", 
					"display_name": "LASTNAME TEST", 
					"phone_number": "null"
				}, "dates": {
					"estimate": "3d", 
					"logged": "", 
					"logged_seconds": "3600", 
					"duedate": "2018-01-10", 
					"created": "2017-12-27T20:36:38.000+0000", 
					"updated": "2018-01-02T21:16:29.000+0000", 
					"started": "2018-01-08"
				}, 
				"crucible_id": "TS-0987", 
				"summary": "This is a summary", 
				"component": "", 
				"status": "QA Pass", 
				"story_point": 3, 
				"sprint": "4.02", 
				"epic_link": "TS-1234", 
				"label": "LABELS", 
				"comments": [
					{
						"comment": "<p>This is the first comment2</p>",
						"raw_comment": "This is the first comment2", 
						"id": "321438", 
						"key": "TS-1234", 
						"username": "tu1234", 
						"email": "tu1234@test.com", 
						"display_name": "TEST, TEST (tu1234)", 
						"comment_type": "info", 
						"created": "2017-12-27T20:36:41.633+0000", 
						"updated": "2017-12-27T20:38:10.067+0000", 
						"visibility": ""
					}
				], 
				"qa_steps": "", 
				"attachments": [
					{
						"filename": "screenshot-1.png", 
						"link": "http://jira.web.test.com/secure/attachment/42100/screenshot-1.png"
					}
				], 
				"watchers": [
					{
						"username": "tu0483", 
						"displayName": "JIRA mech ID"
					}, 
					{
						"username": "tu1234", 
						"displayName": "TEST, TEST"
					}
				], 
				"priority": "Minor", 
				"severity": "Severity 3", 
				"code_reviewer": {
					"username": "tu1234", 
					"displayName": "TEST, TEST"
				}, 
				"issue_type": "Story", 
				"environment": "env testing", 
				"links": [
					{
						"id": "51042", 
						"self": "http://jira.web.test.com/rest/api/2/issueLink/51042", 
						"type": {
							"id": "10000", 
							"name": "Blocks", 
							"inward": "is blocked by", 
							"outward": "blocks", 
							"self": "http://jira.web.test.com/rest/api/2/issueLinkType/10000"
						}, 
						"inwardIssue": {
							"id": "89473", 
							"key": "TS-7795", 
							"self": "http://jira.web.test.com/rest/api/2/issue/89473", 
							"fields": {
								"summary": "summary of another ticket", 
								"status": {
									"self": "http://jira.web.test.com/rest/api/2/status/10105",
									 "description": "", 
									 "iconUrl": "http://jira.web.test.com/images/icons/statuses/generic.png", 
									 "name": "In Development", 
									 "id": "10105", 
									 "statusCategory": {
									 	"self": "http://jira.web.test.com/rest/api/2/statuscategory/4", 
									 	"id": 4, 
									 	"key": "indeterminate", 
									 	"colorName": "yellow", 
									 	"name": "In Progress"
									}
								}, 
								"priority": {
									"self": "http://jira.web.test.com/rest/api/2/priority/7", 
									"iconUrl": "http://jira.web.test.com/images/icons/priorities/lowest.svg", 
									"name": "Minor", 
									"id": "7"
								}, 
								"issuetype": {
									"self": "http://jira.web.test.com/rest/api/2/issuetype/10001", 
									"id": "10001", 
									"description": "jira issue number", 
									"iconUrl": "http://jira.web.test.com/images/icons/issuetypes/story.svg", 
									"name": "Story", 
									"subtask": false
								}
							}
						}
					}
				], 
				"commit": "[TS-1234] Ticket #1029386 This is a summary", 
				"branch": "testuser-1029386-branch-testing"
			},
			{
				"key": "TS-1236", 
				"msrp": "1029386", 
				"user_details": {
					"username": "testuser", 
					"email_address": "testuser@test.com", 
					"display_name": "User, Test"
				}, 
				"username": "testuser", 
				"customer_details": {
					"username": "tu1234", 
					"email": "tu1234@test.com", 
					"display_name": "LASTNAME TEST", 
					"phone_number": "null"
				}, "dates": {
					"estimate": "3d", 
					"logged": "", 
					"logged_seconds": "3600", 
					"duedate": "2018-01-10", 
					"created": "2017-12-27T20:36:38.000+0000", 
					"updated": "2018-01-02T21:16:29.000+0000", 
					"started": "2018-01-08"
				}, 
				"crucible_id": "", 
				"summary": "This is a summary 5", 
				"component": "", 
				"status": "In Development", 
				"story_point": 3, 
				"sprint": "4.02", 
				"epic_link": "TS-1234", 
				"label": "LABELS", 
				"comments": [
					{
						"comment": "<p>This is the first comment3</p>",
						"raw_comment": "This is the first comment3", 
						"id": "321438", 
						"key": "TS-1234", 
						"username": "tu1234", 
						"email": "tu1234@test.com", 
						"display_name": "TEST, TEST (tu1234)", 
						"comment_type": "info", 
						"created": "2017-12-27T20:36:41.633+0000", 
						"updated": "2017-12-27T20:38:10.067+0000", 
						"visibility": ""
					}
				], 
				"qa_steps": "", 
				"attachments": [
					{
						"filename": "screenshot-1.png", 
						"link": "http://jira.web.test.com/secure/attachment/42100/screenshot-1.png"
					}
				], 
				"watchers": [
					{
						"username": "tu0483", 
						"displayName": "JIRA mech ID"
					}, 
					{
						"username": "tu1234", 
						"displayName": "TEST, TEST"
					}
				], 
				"priority": "Minor", 
				"severity": "Severity 3", 
				"code_reviewer": {
					"username": "tu1234", 
					"displayName": "TEST, TEST"
				}, 
				"issue_type": "Story", 
				"environment": "env testing", 
				"links": [
					{
						"id": "51042", 
						"self": "http://jira.web.test.com/rest/api/2/issueLink/51042", 
						"type": {
							"id": "10000", 
							"name": "Blocks", 
							"inward": "is blocked by", 
							"outward": "blocks", 
							"self": "http://jira.web.test.com/rest/api/2/issueLinkType/10000"
						}, 
						"inwardIssue": {
							"id": "89473", 
							"key": "TS-7795", 
							"self": "http://jira.web.test.com/rest/api/2/issue/89473", 
							"fields": {
								"summary": "summary of another ticket", 
								"status": {
									"self": "http://jira.web.test.com/rest/api/2/status/10105",
									 "description": "", 
									 "iconUrl": "http://jira.web.test.com/images/icons/statuses/generic.png", 
									 "name": "In Development", 
									 "id": "10105", 
									 "statusCategory": {
									 	"self": "http://jira.web.test.com/rest/api/2/statuscategory/4", 
									 	"id": 4, 
									 	"key": "indeterminate", 
									 	"colorName": "yellow", 
									 	"name": "In Progress"
									}
								}, 
								"priority": {
									"self": "http://jira.web.test.com/rest/api/2/priority/7", 
									"iconUrl": "http://jira.web.test.com/images/icons/priorities/lowest.svg", 
									"name": "Minor", 
									"id": "7"
								}, 
								"issuetype": {
									"self": "http://jira.web.test.com/rest/api/2/issuetype/10001", 
									"id": "10001", 
									"description": "jira issue number", 
									"iconUrl": "http://jira.web.test.com/images/icons/issuetypes/story.svg", 
									"name": "Story", 
									"subtask": false
								}
							}
						}
					}
				], 
				"commit": "[TS-1234] Ticket #1029386 This is a summary", 
				"branch": "testuser-1029386-branch-testing"
			},
			{
				"key": "TS-1238", 
				"msrp": "1029386", 
				"user_details": {
					"username": "testuser", 
					"email_address": "testuser@test.com", 
					"display_name": "User, Test"
				}, 
				"username": "testuser", 
				"customer_details": {
					"username": "tu1234", 
					"email": "tu1234@test.com", 
					"display_name": "LASTNAME TEST", 
					"phone_number": "null"
				}, "dates": {
					"estimate": "3d", 
					"logged": "2d", 
					"logged_seconds": "3600", 
					"duedate": "2018-01-10", 
					"created": "2017-12-27T20:36:38.000+0000", 
					"updated": "2018-01-02T21:16:29.000+0000", 
					"started": "2018-01-08"
				}, 
				"crucible_id": "", 
				"summary": "This is a summary again - this is a really long summary", 
				"component": "", 
				"status": "In Sprint", 
				"story_point": 3, 
				"sprint": "4.02", 
				"epic_link": "TS-1234", 
				"label": "LABELS", 
				"comments": [
					{
						"comment": "<p>This is the first comment4</p>",
						"raw_comment": "This is the first comment4", 
						"id": "321438", 
						"key": "TS-1234", 
						"username": "tu1234", 
						"email": "tu1234@test.com", 
						"display_name": "TEST, TEST (tu1234)", 
						"comment_type": "info", 
						"created": "2017-12-27T20:36:41.633+0000", 
						"updated": "2017-12-27T20:38:10.067+0000", 
						"visibility": ""
					}
				], 
				"qa_steps": "", 
				"attachments": [
					{
						"filename": "screenshot-1.png", 
						"link": "http://jira.web.test.com/secure/attachment/42100/screenshot-1.png"
					}
				], 
				"watchers": [
					{
						"username": "tu0483", 
						"displayName": "JIRA mech ID"
					}, 
					{
						"username": "tu1234", 
						"displayName": "TEST, TEST"
					}
				], 
				"priority": "Minor", 
				"severity": "Severity 3", 
				"code_reviewer": {
					"username": "tu1234", 
					"displayName": "TEST, TEST"
				}, 
				"issue_type": "Story", 
				"environment": "env testing", 
				"links": [
					{
						"id": "51042", 
						"self": "http://jira.web.test.com/rest/api/2/issueLink/51042", 
						"type": {
							"id": "10000", 
							"name": "Blocks", 
							"inward": "is blocked by", 
							"outward": "blocks", 
							"self": "http://jira.web.test.com/rest/api/2/issueLinkType/10000"
						}, 
						"inwardIssue": {
							"id": "89473", 
							"key": "TS-7795", 
							"self": "http://jira.web.test.com/rest/api/2/issue/89473", 
							"fields": {
								"summary": "summary of another ticket", 
								"status": {
									"self": "http://jira.web.test.com/rest/api/2/status/10105",
									 "description": "", 
									 "iconUrl": "http://jira.web.test.com/images/icons/statuses/generic.png", 
									 "name": "In Development", 
									 "id": "10105", 
									 "statusCategory": {
									 	"self": "http://jira.web.test.com/rest/api/2/statuscategory/4", 
									 	"id": 4, 
									 	"key": "indeterminate", 
									 	"colorName": "yellow", 
									 	"name": "In Progress"
									}
								}, 
								"priority": {
									"self": "http://jira.web.test.com/rest/api/2/priority/7", 
									"iconUrl": "http://jira.web.test.com/images/icons/priorities/lowest.svg", 
									"name": "Minor", 
									"id": "7"
								}, 
								"issuetype": {
									"self": "http://jira.web.test.com/rest/api/2/issuetype/10001", 
									"id": "10001", 
									"description": "jira issue number", 
									"iconUrl": "http://jira.web.test.com/images/icons/issuetypes/story.svg", 
									"name": "Story", 
									"subtask": false
								}
							}
						}
					}
				], 
				"commit": "[TS-1234] Ticket #1029386 This is a summary", 
				"branch": "testuser-1029386-branch-testing"
			}
		], 
		status: true
	});
});

router.post('/status', function(req, res, next) {
	res.json({
		status: true,
		data: {
			comment_response: {
				data: {
					comment: req.body.comment ? `<p>${req.body.comment}</p>` : `<p>QA Pass</p>`, 
					raw_comment: req.body.comment || 'QA Pass',
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
			merge_code: {status: true},
			qa_pass: {status: true}
		}
	});
});

module.exports = router;
