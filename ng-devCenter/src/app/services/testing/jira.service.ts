import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { DataService } from './../data.service';
import { UserService } from './../user.service';
import { ConfigService } from './../config.service'

@Injectable()
export class JiraServiceTest extends DataService {
	title:string = '';
	jql:string=''
	firstLoad = true;

	/*
	*/
	constructor(
		public http: HttpClient, 
		public config:ConfigService,
		public user:UserService, 
		public sanitizer: DomSanitizer
	) {
		super(http, config, user, sanitizer);
	}


	/*
	*/
	getFilterData(jiraListType:string): Observable<any> {
		return Observable.of({
			total_tickets: 4, 
			data: [
				{
					"key": "UD-7990", 
					"msrp": "119789", 
					"user_details": {
						"username": "te1680", 
						"email_address": "te1680@att.com", 
						"display_name": "Esposito, Thomas"
					}, 
					"username": "te1680", 
					"customer_details": {
						"username": "tt0163", 
						"email": "tt0163@att.com", 
						"display_name": "Trenton Trama", 
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
					"summary": "Add UI/UX for RDS data collection", 
					"component": "", 
					"status": "In Sprint", 
					"story_point": 3, 
					"sprint": "9.02", 
					"epic_link": "UD-5384", 
					"label": "UnifiedDesktop(UD)", 
					"comments": [
						{
							"comment": "This is the first comment", 
							"id": "321438", 
							"key": "UD-7990", 
							"username": "tt0163", 
							"email": "tt0163@att.com", 
							"display_name": "Trama, Trent (tt0163)", 
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
							"link": "http://jira.web.att.com/secure/attachment/42100/screenshot-1.png"
						}
					], 
					"watchers": [
						{
							"username": "m07915", 
							"displayName": "JIRA mech ID"
						}, 
						{
							"username": "tt0163", 
							"displayName": "Trama, Trent"
						}
					], 
					"priority": "Minor", 
					"severity": "Severity 3", 
					"code_reviewer": {
						"username": "tt0163", 
						"displayName": "Trama, Trent"
					}, 
					"issue_type": "Story", 
					"environment": "BizOps Accelerate", 
					"links": [
						{
							"id": "51042", 
							"self": "http://jira.web.att.com/rest/api/2/issueLink/51042", 
							"type": {
								"id": "10000", 
								"name": "Blocks", 
								"inward": "is blocked by", 
								"outward": "blocks", 
								"self": "http://jira.web.att.com/rest/api/2/issueLinkType/10000"
							}, 
							"inwardIssue": {
								"id": "89473", 
								"key": "UD-7795", 
								"self": "http://jira.web.att.com/rest/api/2/issue/89473", 
								"fields": {
									"summary": "Add RDS write methods to ember model", 
									"status": {
										"self": "http://jira.web.att.com/rest/api/2/status/10105",
										 "description": "", 
										 "iconUrl": "http://jira.web.att.com/images/icons/statuses/generic.png", 
										 "name": "In Development", 
										 "id": "10105", 
										 "statusCategory": {
										 	"self": "http://jira.web.att.com/rest/api/2/statuscategory/4", 
										 	"id": 4, 
										 	"key": "indeterminate", 
										 	"colorName": "yellow", 
										 	"name": "In Progress"
										}
									}, 
									"priority": {
										"self": "http://jira.web.att.com/rest/api/2/priority/7", 
										"iconUrl": "http://jira.web.att.com/images/icons/priorities/lowest.svg", 
										"name": "Minor", 
										"id": "7"
									}, 
									"issuetype": {
										"self": "http://jira.web.att.com/rest/api/2/issuetype/10001", 
										"id": "10001", 
										"description": "Created by JIRA Software - do not edit or delete. Issue type for a user story.", 
										"iconUrl": "http://jira.web.att.com/images/icons/issuetypes/story.svg", 
										"name": "Story", 
										"subtask": false
									}
								}
							}
						}
					], 
					"commit": "[UD-7990] Ticket #119789 Add UI/UX for RDS data collection", 
					"branch": "te1680-119789-Add-UI-UX-for-RDS-data-collection"
				},
				{
					"key": "UD-7990", 
					"msrp": "119789", 
					"user_details": {
						"username": "te1680", 
						"email_address": "te1680@att.com", 
						"display_name": "Esposito, Thomas"
					}, 
					"username": "te1680", 
					"customer_details": {
						"username": "tt0163", 
						"email": "tt0163@att.com", 
						"display_name": "Trenton Trama", 
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
					"summary": "Add UI/UX for RDS data collection", 
					"component": "", 
					"status": "In Sprint", 
					"story_point": 3, 
					"sprint": "9.02", 
					"epic_link": "UD-5384", 
					"label": "UnifiedDesktop(UD)", 
					"comments": [
						{
							"comment": "This is the first comment", 
							"id": "321438", 
							"key": "UD-7990", 
							"username": "tt0163", 
							"email": "tt0163@att.com", 
							"display_name": "Trama, Trent (tt0163)", 
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
							"link": "http://jira.web.att.com/secure/attachment/42100/screenshot-1.png"
						}
					], 
					"watchers": [
						{
							"username": "m07915", 
							"displayName": "JIRA mech ID"
						}, 
						{
							"username": "tt0163", 
							"displayName": "Trama, Trent"
						}
					], 
					"priority": "Minor", 
					"severity": "Severity 3", 
					"code_reviewer": {
						"username": "tt0163", 
						"displayName": "Trama, Trent"
					}, 
					"issue_type": "Story", 
					"environment": "BizOps Accelerate", 
					"links": [
						{
							"id": "51042", 
							"self": "http://jira.web.att.com/rest/api/2/issueLink/51042", 
							"type": {
								"id": "10000", 
								"name": "Blocks", 
								"inward": "is blocked by", 
								"outward": "blocks", 
								"self": "http://jira.web.att.com/rest/api/2/issueLinkType/10000"
							}, 
							"inwardIssue": {
								"id": "89473", 
								"key": "UD-7795", 
								"self": "http://jira.web.att.com/rest/api/2/issue/89473", 
								"fields": {
									"summary": "Add RDS write methods to ember model", 
									"status": {
										"self": "http://jira.web.att.com/rest/api/2/status/10105",
										 "description": "", 
										 "iconUrl": "http://jira.web.att.com/images/icons/statuses/generic.png", 
										 "name": "In Development", 
										 "id": "10105", 
										 "statusCategory": {
										 	"self": "http://jira.web.att.com/rest/api/2/statuscategory/4", 
										 	"id": 4, 
										 	"key": "indeterminate", 
										 	"colorName": "yellow", 
										 	"name": "In Progress"
										}
									}, 
									"priority": {
										"self": "http://jira.web.att.com/rest/api/2/priority/7", 
										"iconUrl": "http://jira.web.att.com/images/icons/priorities/lowest.svg", 
										"name": "Minor", 
										"id": "7"
									}, 
									"issuetype": {
										"self": "http://jira.web.att.com/rest/api/2/issuetype/10001", 
										"id": "10001", 
										"description": "Created by JIRA Software - do not edit or delete. Issue type for a user story.", 
										"iconUrl": "http://jira.web.att.com/images/icons/issuetypes/story.svg", 
										"name": "Story", 
										"subtask": false
									}
								}
							}
						}
					], 
					"commit": "[UD-7990] Ticket #119789 Add UI/UX for RDS data collection", 
					"branch": "te1680-119789-Add-UI-UX-for-RDS-data-collection"
				},
				{
					"key": "UD-7990", 
					"msrp": "119789", 
					"user_details": {
						"username": "te1680", 
						"email_address": "te1680@att.com", 
						"display_name": "Esposito, Thomas"
					}, 
					"username": "te1680", 
					"customer_details": {
						"username": "tt0163", 
						"email": "tt0163@att.com", 
						"display_name": "Trenton Trama", 
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
					"summary": "Add UI/UX for RDS data collection", 
					"component": "", 
					"status": "In Sprint", 
					"story_point": 3, 
					"sprint": "9.02", 
					"epic_link": "UD-5384", 
					"label": "UnifiedDesktop(UD)", 
					"comments": [
						{
							"comment": "This is the first comment", 
							"id": "321438", 
							"key": "UD-7990", 
							"username": "tt0163", 
							"email": "tt0163@att.com", 
							"display_name": "Trama, Trent (tt0163)", 
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
							"link": "http://jira.web.att.com/secure/attachment/42100/screenshot-1.png"
						}
					], 
					"watchers": [
						{
							"username": "m07915", 
							"displayName": "JIRA mech ID"
						}, 
						{
							"username": "tt0163", 
							"displayName": "Trama, Trent"
						}
					], 
					"priority": "Minor", 
					"severity": "Severity 3", 
					"code_reviewer": {
						"username": "tt0163", 
						"displayName": "Trama, Trent"
					}, 
					"issue_type": "Story", 
					"environment": "BizOps Accelerate", 
					"links": [
						{
							"id": "51042", 
							"self": "http://jira.web.att.com/rest/api/2/issueLink/51042", 
							"type": {
								"id": "10000", 
								"name": "Blocks", 
								"inward": "is blocked by", 
								"outward": "blocks", 
								"self": "http://jira.web.att.com/rest/api/2/issueLinkType/10000"
							}, 
							"inwardIssue": {
								"id": "89473", 
								"key": "UD-7795", 
								"self": "http://jira.web.att.com/rest/api/2/issue/89473", 
								"fields": {
									"summary": "Add RDS write methods to ember model", 
									"status": {
										"self": "http://jira.web.att.com/rest/api/2/status/10105",
										 "description": "", 
										 "iconUrl": "http://jira.web.att.com/images/icons/statuses/generic.png", 
										 "name": "In Development", 
										 "id": "10105", 
										 "statusCategory": {
										 	"self": "http://jira.web.att.com/rest/api/2/statuscategory/4", 
										 	"id": 4, 
										 	"key": "indeterminate", 
										 	"colorName": "yellow", 
										 	"name": "In Progress"
										}
									}, 
									"priority": {
										"self": "http://jira.web.att.com/rest/api/2/priority/7", 
										"iconUrl": "http://jira.web.att.com/images/icons/priorities/lowest.svg", 
										"name": "Minor", 
										"id": "7"
									}, 
									"issuetype": {
										"self": "http://jira.web.att.com/rest/api/2/issuetype/10001", 
										"id": "10001", 
										"description": "Created by JIRA Software - do not edit or delete. Issue type for a user story.", 
										"iconUrl": "http://jira.web.att.com/images/icons/issuetypes/story.svg", 
										"name": "Story", 
										"subtask": false
									}
								}
							}
						}
					], 
					"commit": "[UD-7990] Ticket #119789 Add UI/UX for RDS data collection", 
					"branch": "te1680-119789-Add-UI-UX-for-RDS-data-collection"
				},
				{
					"key": "UD-7990", 
					"msrp": "119789", 
					"user_details": {
						"username": "te1680", 
						"email_address": "te1680@att.com", 
						"display_name": "Esposito, Thomas"
					}, 
					"username": "te1680", 
					"customer_details": {
						"username": "tt0163", 
						"email": "tt0163@att.com", 
						"display_name": "Trenton Trama", 
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
					"summary": "Add UI/UX for RDS data collection", 
					"component": "", 
					"status": "In Sprint", 
					"story_point": 3, 
					"sprint": "9.02", 
					"epic_link": "UD-5384", 
					"label": "UnifiedDesktop(UD)", 
					"comments": [
						{
							"comment": "This is the first comment", 
							"id": "321438", 
							"key": "UD-7990", 
							"username": "tt0163", 
							"email": "tt0163@att.com", 
							"display_name": "Trama, Trent (tt0163)", 
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
							"link": "http://jira.web.att.com/secure/attachment/42100/screenshot-1.png"
						}
					], 
					"watchers": [
						{
							"username": "m07915", 
							"displayName": "JIRA mech ID"
						}, 
						{
							"username": "tt0163", 
							"displayName": "Trama, Trent"
						}
					], 
					"priority": "Minor", 
					"severity": "Severity 3", 
					"code_reviewer": {
						"username": "tt0163", 
						"displayName": "Trama, Trent"
					}, 
					"issue_type": "Story", 
					"environment": "BizOps Accelerate", 
					"links": [
						{
							"id": "51042", 
							"self": "http://jira.web.att.com/rest/api/2/issueLink/51042", 
							"type": {
								"id": "10000", 
								"name": "Blocks", 
								"inward": "is blocked by", 
								"outward": "blocks", 
								"self": "http://jira.web.att.com/rest/api/2/issueLinkType/10000"
							}, 
							"inwardIssue": {
								"id": "89473", 
								"key": "UD-7795", 
								"self": "http://jira.web.att.com/rest/api/2/issue/89473", 
								"fields": {
									"summary": "Add RDS write methods to ember model", 
									"status": {
										"self": "http://jira.web.att.com/rest/api/2/status/10105",
										 "description": "", 
										 "iconUrl": "http://jira.web.att.com/images/icons/statuses/generic.png", 
										 "name": "In Development", 
										 "id": "10105", 
										 "statusCategory": {
										 	"self": "http://jira.web.att.com/rest/api/2/statuscategory/4", 
										 	"id": 4, 
										 	"key": "indeterminate", 
										 	"colorName": "yellow", 
										 	"name": "In Progress"
										}
									}, 
									"priority": {
										"self": "http://jira.web.att.com/rest/api/2/priority/7", 
										"iconUrl": "http://jira.web.att.com/images/icons/priorities/lowest.svg", 
										"name": "Minor", 
										"id": "7"
									}, 
									"issuetype": {
										"self": "http://jira.web.att.com/rest/api/2/issuetype/10001", 
										"id": "10001", 
										"description": "Created by JIRA Software - do not edit or delete. Issue type for a user story.", 
										"iconUrl": "http://jira.web.att.com/images/icons/issuetypes/story.svg", 
										"name": "Story", 
										"subtask": false
									}
								}
							}
						}
					], 
					"commit": "[UD-7990] Ticket #119789 Add UI/UX for RDS data collection", 
					"branch": "te1680-119789-Add-UI-UX-for-RDS-data-collection"
				}
			], 
			status: true
		});
	}

	/**
	*/
	setPing({key, ping_type}): Observable<any> {
		return Observable.of({
			data: "999 push messages remaining today",
			status: true
		});
	}

	/**
	*/
	getATicketDetails(key){
		return Observable.of({
			total_tickets: 1, 
			data: [
				{
					"key": "UD-7990", 
					"msrp": "119789", 
					"user_details": {
						"username": "te1680", 
						"email_address": "te1680@att.com", 
						"display_name": "Esposito, Thomas"
					}, 
					"username": "te1680", 
					"customer_details": {
						"username": "tt0163", 
						"email": "tt0163@att.com", 
						"display_name": "Trenton Trama", 
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
					"summary": "Add UI/UX for RDS data collection", 
					"component": "", 
					"status": "In Sprint", 
					"story_point": 3, 
					"sprint": "9.02", 
					"epic_link": "UD-5384", 
					"label": "UnifiedDesktop(UD)", 
					"comments": [
						{
							"comment": "This is the first comment", 
							"id": "321438", 
							"key": "UD-7990", 
							"username": "tt0163", 
							"email": "tt0163@att.com", 
							"display_name": "Trama, Trent (tt0163)", 
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
							"link": "http://jira.web.att.com/secure/attachment/42100/screenshot-1.png"
						}
					], 
					"watchers": [
						{
							"username": "m07915", 
							"displayName": "JIRA mech ID"
						}, 
						{
							"username": "tt0163", 
							"displayName": "Trama, Trent"
						}
					], 
					"priority": "Minor", 
					"severity": "Severity 3", 
					"code_reviewer": {
						"username": "tt0163", 
						"displayName": "Trama, Trent"
					}, 
					"issue_type": "Story", 
					"environment": "BizOps Accelerate", 
					"links": [
						{
							"id": "51042", 
							"self": "http://jira.web.att.com/rest/api/2/issueLink/51042", 
							"type": {
								"id": "10000", 
								"name": "Blocks", 
								"inward": "is blocked by", 
								"outward": "blocks", 
								"self": "http://jira.web.att.com/rest/api/2/issueLinkType/10000"
							}, 
							"inwardIssue": {
								"id": "89473", 
								"key": "UD-7795", 
								"self": "http://jira.web.att.com/rest/api/2/issue/89473", 
								"fields": {
									"summary": "Add RDS write methods to ember model", 
									"status": {
										"self": "http://jira.web.att.com/rest/api/2/status/10105",
										 "description": "", 
										 "iconUrl": "http://jira.web.att.com/images/icons/statuses/generic.png", 
										 "name": "In Development", 
										 "id": "10105", 
										 "statusCategory": {
										 	"self": "http://jira.web.att.com/rest/api/2/statuscategory/4", 
										 	"id": 4, 
										 	"key": "indeterminate", 
										 	"colorName": "yellow", 
										 	"name": "In Progress"
										}
									}, 
									"priority": {
										"self": "http://jira.web.att.com/rest/api/2/priority/7", 
										"iconUrl": "http://jira.web.att.com/images/icons/priorities/lowest.svg", 
										"name": "Minor", 
										"id": "7"
									}, 
									"issuetype": {
										"self": "http://jira.web.att.com/rest/api/2/issuetype/10001", 
										"id": "10001", 
										"description": "Created by JIRA Software - do not edit or delete. Issue type for a user story.", 
										"iconUrl": "http://jira.web.att.com/images/icons/issuetypes/story.svg", 
										"name": "Story", 
										"subtask": false
									}
								}
							}
						}
					], 
					"commit": "[UD-7990] Ticket #119789 Add UI/UX for RDS data collection", 
					"branch": "te1680-119789-Add-UI-UX-for-RDS-data-collection"
				}
			], 
			status: true
		});
	}

	/*
	*/
	searchTicket(msrp:string): Observable<any> {
		return Observable.of({
			status: true, 
			data: "TEST-1234"
		});
	}

	/**
	*/
	getTicketBranches(msrp:string): Observable<any> {
		return Observable.of({
			data:{
				"status": true, 
				"data": [
					{
						"repo": "test1", 
						"branches": [
							"test-100000-test branch"
						], 
						"all": [
							"DEV", 
							"test-100000-test branch", 
							"test-100001-test branch2", 
							"test-100002-test branch3", 
							"MASTER9.10", 
							""
						]
					},
					{
						"repo": "test2", 
						"branches": [
							"test-100000-test branch"
						], 
						"all": [
							"DEV", 
							"test-100000-test branch", 
							"test-100001-test branch2", 
							"test-100002-test branch3", 
							"MASTER9.10", 
							""
						]
					}
				]
			},
			status: true
		});
	}

	/**
	*/
	getRepos(): Observable<any>{
		return Observable.of({
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
		});
	}

	/**
	*/
	generateQA(postData): Observable<any> {
		return Observable.of({
			status: true, 
			data: "CR-TEST-1234"
		});
	}

	/**
	*/
	getBranches(repoName): Observable<any> {
		return Observable.of({
			data:[
				"test",
				"test1",
				"test2",
				"test3"
			],
			status: true
		});
	}

	/**
	*/
	workLog(postData): Observable<any> {
		return Observable.of(this.commentResponse);
	}

	commentResponse = {
		data:{
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
				 "body": "TESTT", 
				 "updateAuthor": {
				 	"self": "http://jira.com/rest/api/2/user?username=testuser", 
				 	"name": "testuser", 
				 	"key": "testuser", 
				 	"emailAddress": "testuser@att.com",
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
		},
		status: true
	}

	/**
	*/
	editComment(postData): Observable<any> {
		return Observable.of({
			data:this.commentResponse,
			status: true
		});
	}

	/**
	*/
	deleteComment(comment_id, key): Observable<any> {
		return Observable.of({
			data:{},
			status: true
		});
	}

	/**
	*/
	changeStatus(postData): Observable<any> {
		return Observable.of({
			data:{},
			status: true
		});
	}

	/**
	*/
	getProfile(): Observable<any> {
		return Observable.of({
			data:{
				"self": "http://jira.com/rest/api/2/user?username=testuser",
				"key": "testuser", 
				"name": "testuser", 
				"emailAddress": "testuser@testing.com", 
				"avatarUrls": {
					"48x48": "http://jira.com/secure/useravatar?ownerId=testuser&avatarId=11051", 
					"24x24": "http://jira.com/secure/useravatar?size=small&ownerId=testuser&avatarId=11051", 
					"16x16": "http://jira.com/secure/useravatar?size=xsmall&ownerId=testuser&avatarId=11051", 
					"32x32": "http://jira.com/secure/useravatar?size=medium&ownerId=testuser&avatarId=11051"
				},
				"displayName": "User, Test (testuser)", 
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
				"expand": "groups,applicationRoles"
			},
			status: true
		});
	}

}
