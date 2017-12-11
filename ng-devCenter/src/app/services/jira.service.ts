import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { DataService } from './data.service';
import { UserService } from './user.service';
import { ConfigService } from './config.service'

@Injectable()
export class JiraService extends DataService {
	title:string = '';

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
		let filterNumber:string = '';
		let jql:string = '';

		switch(jiraListType) {
			case 'pcr':
				jql = this.config.pcr;
				this.title = 'Peer Code Review';
				break;

			case 'beta':
				jql=this.config.beta;
				this.title = 'Beta';
				break;

			case 'cr':
				jql=this.config.cr;
				this.title = 'Code Review';
				break;

			case 'qa':
				jql=this.config.qa;
				this.title = 'QA';
				break;

			case 'uctready':
				jql=this.config.uctready;
				this.title = 'UCT Ready';
				break;

			case 'allmy':
				jql = this.config.allmy(this.user.username);
				filterNumber = '11418';
				this.title = 'All My';
				break;

			case 'allopen':
				jql=this.config.allopen;
				this.title = 'All Open';
				break;

			case 'teamdb_ember':
				jql=this.config.teamdb_ember;
				this.title = 'TeamDB Ember';
				break;

			case 'apollo':
				jql=this.config.apollo;
				this.title = 'Apollo';
				break;

			case 'sme':
				jql=this.config.sme;
				this.title = 'SME';
				break;

			case 'scrum':
				jql=this.config.scrum;
				this.title = 'Scrum Board';
				break;

			case 'fullscrum':
				jql=this.config.fullScrum;
				this.title = 'Full Scrum Board';
				break;

			case 'rocc':
				jql=this.config.rocc;
				this.title = 'ROCC Automation';
				break;

			case 'starship':
				jql=this.config.starship;
				this.title = 'Starship';
				break;
			case 'pm':
				jql=this.config.pmTickets;
				this.title = 'PM';
				break;

			default:
				jql = this.config.mytickets(this.user.username);
				this.title = 'My Open';
				break;
		}


		return super.getAPI(`${this.apiUrl}/jira/tickets?jql=${jql}&fields=${this.config.fields}&filter=${filterNumber}`);
	}


	setPing({key, ping_type}): Observable<any> {
		return super.postAPI({
			url: `${this.apiUrl}/chat/send_ping`,
			body: { key, ping_type, username: this.user.username }
		});
	}

	/*
	*/
	searchTicket(msrp:string): Observable<any> {
		return super.getAPI(`${this.apiUrl}/jira/getkey/${msrp}`);
	}

	/*
	*/
	getTicketBranches(msrp:string): Observable<any> {
		return super.getAPI(`${this.apiUrl}/git/branches/${msrp}`);
	}

	/*
	*/
	getRepos(): Observable<any>{
		return super.getAPI(`${this.apiUrl}/git/repos`);
	}

	/*
	*/
	generateQA(postData): Observable<any> {

		// add creds
		postData.username = this.user.username;
		postData.password = this.user.password;

		let sources = [];

		// create crucible and post comment
		return super.postAPI({
			url: `${this.apiUrl}/crucible/create`,
			body: postData
		})
	}

	/*
	*/
	getBranches(repoName): Observable<any> {
		return super.getAPI(`${this.apiUrl}/git/repo/${repoName}`);
	}

	/*
	*/
	workLog(postData): Observable<any> {
		return super.postAPI({
			url: `${this.apiUrl}/jira/worklog`,
			body: postData
		});
	}

	/*
	*/
	changeStatus(postData): Observable<any> {
		postData.username = this.user.username;
		
		return super.postAPI({
			url: `${this.apiUrl}/jira/status`,
			body: postData
		});
	}

	/*
	*/
	getProfile(): Observable<any> {
		return super.getAPI(`${this.apiUrl}/jira/profile`);
	}

}
