import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { DataService } from './data.service';
import { UserService } from './user.service';
import { ToastrService } from './../services/toastr.service';

import config from './config';

@Injectable()
export class JiraService extends DataService {
	title:string = '';

	/*
	*/
	constructor(
		public http: HttpClient, 
		public user:UserService, 
		public sanitizer: DomSanitizer, 
		public toastr: ToastrService 
	) {
		super(http, user, sanitizer, toastr);
	}


	/*
	*/
	getFilterData(jiraListType:string): Observable<any> {
		let filterNumber:string = '';
		let jql:string = '';

		switch(jiraListType) {
			case 'pcr':
				jql = config.pcr;
				this.title = 'Peer Code Review';
				break;

			case 'beta':
				jql=config.beta;
				this.title = 'Beta';
				break;

			case 'cr':
				jql=config.cr;
				this.title = 'Code Review';
				break;

			case 'qa':
				jql=config.qa;
				this.title = 'QA';
				break;

			case 'uctready':
				jql=config.uctready;
				this.title = 'UCT Ready';
				break;

			case 'allmy':
				jql = config.allmy(this.user.username);
				filterNumber = '11418';
				this.title = 'All My';
				break;

			case 'allopen':
				jql=config.allopen;
				this.title = 'All Open';
				break;

			case 'teamdb_ember':
				jql=config.teamdb_ember;
				this.title = 'TeamDB Ember';
				break;

			case 'apollo':
				jql=config.apollo;
				this.title = 'Apollo';
				break;

			case 'sme':
				jql=config.sme;
				this.title = 'SME';
				break;

			case 'scrum':
				jql=config.scrum;
				this.title = 'Scrum Board';
				break;

			case 'rocc':
				jql=config.rocc;
				this.title = 'ROCC Automation';
				break;

			default:
				jql = config.mytickets(this.user.username);
				this.title = 'My Open';
				break;
		}


		return super.getAPI(`${this.apiUrl}/jira/tickets?jql=${jql}&fields=${config.fields}&filter=${filterNumber}`);
	}

	/*
	*/
	pcrPass(id, username): Observable<any> {
		return super.postAPI({
			url: `${this.apiUrl}/crucible/review/pcr_pass`,
			body: {
		        crucible_id: id,
				username: username
		    }
		});
	}

	/*
	*/
	pcrComplete(id, username): Observable<any> {
		return super.postAPI({
			url: `${this.apiUrl}/crucible/review/pcr_complete`,
			body: {
		        key: id,
				username: username
		    }
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

	generateQA(postData): Observable<any> {

		// add creds
		postData.username = this.user.username;
		postData.password = this.user.password;

		return super.postAPI({
			url: `${this.apiUrl}/crucible/review/create`,
			body: JSON.stringify(postData)
		});
	}

	getBranches(repoName): Observable<any> {
		return super.getAPI(`${this.apiUrl}/git/repo/${repoName}`);
	}

}
