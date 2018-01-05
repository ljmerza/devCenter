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
			data:{},
			status: true
		});
	}

	/*
	*/
	setPing({key, ping_type}): Observable<any> {
		return Observable.of({
			data:{},
			status: true
		});
	}

	/*
	*/
	getATicketDetails(key){
		return Observable.of({
			data:{},
			status: true
		});
	}

	/*
	*/
	searchTicket(msrp:string): Observable<any> {
		return Observable.of({
			data:{},
			status: true
		});
	}

	/*
	*/
	getTicketBranches(msrp:string): Observable<any> {
		return Observable.of({
			data:{},
			status: true
		});
	}

	/*
	*/
	getRepos(): Observable<any>{
		return Observable.of({
			data:{},
			status: true
		});
	}

	/*
	*/
	generateQA(postData): Observable<any> {
		return Observable.of({
			data:{},
			status: true
		});
	}

	/*
	*/
	getBranches(repoName): Observable<any> {
		return Observable.of({
			data:{},
			status: true
		});
	}

	/*
	*/
	workLog(postData): Observable<any> {
		return Observable.of({
			data:{},
			status: true
		});
	}

	/*
	*/
	editComment(postData): Observable<any> {
		return Observable.of({
			data:{},
			status: true
		});
	}

	/*
	*/
	deleteComment(comment_id, key): Observable<any> {
		return Observable.of({
			data:{},
			status: true
		});
	}

	/*
	*/
	changeStatus(postData): Observable<any> {
		return Observable.of({
			data:{},
			status: true
		});
	}

	/*
	*/
	getProfile(): Observable<any> {
		return Observable.of({
			data:{
				"self": "http://jira.web.att.com/rest/api/2/user?username=lm240n",
				"key": "lm240n", 
				"name": "lm240n", 
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
				"expand": "groups,applicationRoles"
			},
			status: true
		});
	}

}
