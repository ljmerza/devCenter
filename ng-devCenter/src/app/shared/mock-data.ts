export const commentResponse = {
	status: true, 
	data: {
		"self": "http://jira.com/rest/api/2/issue/83338/comment/323759",
		 "id": "323759", 
		 "author": {
		 	"self": "http://jira.com/rest/api/2/user?username=testuser", 
		 	"name": "testuser", 
		 	"key": "testuser", 
		 	"emailAddress": "testuser@test.com", 
		 	"avatarUrls": {
		 		"48x48": "http://jira.com/secure/useravatar?ownerId=testuser&avatarId=11051", 
		 		"24x24": "http://jira.com/secure/useravatar?size=small&ownerId=testuser&avatarId=11051", 
		 		"16x16": "http://jira.com/secure/useravatar?size=xsmall&ownerId=testuser&avatarId=11051", 
		 		"32x32": "http://jira.com/secure/useravatar?size=medium&ownerId=testuser&avatarId=11051"
		 	}, 
		 	"displayName": "User, Test (testuser)", 
		 	"active": true, 
		 	"timeZone": "America/New_York"
		 }, 
		 "body": "test",
		 "renderedBody": "<p>test</p><hr><br><br>test",
		 "updateAuthor": {
		 	"self": "http://jira.com/rest/api/2/user?username=testuser", 
		 	"name": "testuser", 
		 	"key": "testuser", 
		 	"emailAddress": "testuser@test.com",
		 	"avatarUrls": {
		 		"48x48": "http://jira.com/secure/useravatar?ownerId=testuser&avatarId=11051", 
		 		"24x24": "http://jira.com/secure/useravatar?size=small&ownerId=testuser&avatarId=11051", 
		 		"16x16": "http://jira.com/secure/useravatar?size=xsmall&ownerId=testuser&avatarId=11051", 
		 		"32x32": "http://jira.com/secure/useravatar?size=medium&ownerId=testuser&avatarId=11051"
		 	}, 
		 	"displayName": "User, Test (testuser)", 
		 	"active": true, 
		 	"timeZone": "America/New_York"
		}, 
		"created": (new Date()).toISOString(), 
		"updated": (new Date()).toISOString(), 
		"visibility": {
		 	"type": "role", 
		 	"value": "Developers"
		}
	}
}
export const workLog = this.commentResponse;
export const editComment = this.commentResponse;

export const getTickets = {
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
				"logged": "2d", 
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
}

export const setPing = {
	data: "999 push messages remaining today",
	status: true
}

export const getATicketDetails = {
	total_tickets: 1, 
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
			}, 
			"dates": {
				"estimate": "3d", 
				"logged": "", 
				"duedate": "2018-01-10", 
				"created": "2017-12-27T20:36:38.000+0000", 
				"updated": "2018-01-02T21:16:29.000+0000", 
				"started": "2018-01-08"
			}, 
			"crucible_id": "TS-1245", 
			"summary": "This is a summary", 
			"component": "", 
			"status": "In Sprint", 
			"story_point": 3, 
			"sprint": "4.02", 
			"epic_link": "TS-1234", 
			"label": "LABELS", 
			"comments": [
				{
					"comment": "<p>This is the first comment6</p>",
					"raw_comment": "This is the first comment6", 
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
}

/*
*/
export const searchTicket = {
	status: true, 
	data: "TEST-1234"
}

export const getTicketBranches = {
	status: true, 
	data: [
		{
			repo: "test1", 
			branches: [
				"test-100000-test branch"
			], 
			all: [
				"DEV", 
				"test-100000-test branch", 
				"test-100001-test branch2", 
				"test-100002-test branch3", 
				"MASTER9.10",
			]
		},
		{
			repo: "test2", 
			branches: [
				"test-100000-test branch"
			], 
			all: [
				"DEV", 
				"test-100000-test branch", 
				"test-100001-test branch2", 
				"test-100002-test branch3", 
				"MASTER9.10",
			]
		},
		{
			repo: "test3", 
			branches: [
				"test-100000-test branch"
			], 
			all: [
				"DEV", 
				"test-100000-test branch", 
				"test-100001-test branch2", 
				"test-100002-test branch3", 
				"MASTER9.10",
			]
		},
	]
}

export const getRepos = {
	status: true, 
	data: [
		{"name": "test1"}, 
		{"name": "test2"}, 
		{"name": "test3"}, 
		{"name": "test4"}, 
		{"name": "test5"}, 
		{"name": "test6"}, 
		{"name": "test7"}, 
		{"name": "test8"}, 
		{"name": "test9"} 
	]
}

export const generateQA = {
	status: true, 
	data: {
		comment: commentResponse.data,
		crucible_id: 'CR-123456'
	}
}

export const getBranches = {
	data:[
		"test",
		"test1",
		"test2",
		"test3"
	],
	status: true
}

export const deleteComment = {
	data:{},
	status: true
}

export const changeStatus = {
	data:{},
	status: true
}

export const getProfile = {
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
		"active": true, "timeZone": 
		"America/New_York", 
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
}

export const setPingSettings = {
	status: true, 
	data: {}
}
