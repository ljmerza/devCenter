export const commentResponse = {
	status: true, 
	data: {
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
}
export const workLog = this.commentResponse;
export const editComment = this.commentResponse;

export const getTickets = 

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
				"logged_seconds": "0", 
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

export const searchTicket = {
	status: true, 
	data: "TEST-1234"
}


export const generateQA = {
	status: true, 
	data: {
		comment: commentResponse.data,
		crucible_id: 'CR-123456'
	}
}


export const deleteComment = {
	data:{},
	status: true
}

export const changeStatus = {
	data:{},
	status: true
}


export const setPingSettings = {
	status: true, 
	data: {}
}
