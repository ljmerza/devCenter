import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { APIService } from './api.service';
import { UserService } from './user.service';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage.service';

import { environment } from '../../environments/environment';

@Injectable()
export class JiraService {
	title:string = '';
	jql:string=''
	firstLoad = true;

	/*
	*/
	constructor(
		public http:HttpClient, public config:ConfigService,
		public lStore:LocalStorageService,
		public user:UserService, public api:APIService
	) { }

	apiUrl:string = `${environment.apiUrl}:${environment.port}/dev_center`;

	/*
	*/
	getFilterData(jiraListType:string): Observable<any> {

		switch(jiraListType) {
			case 'pcr':
				this.jql = this.config.pcr;
				this.title = 'Peer Code Review';
				break;
			case 'beta':
				this.jql = this.config.beta;
				this.title = 'Beta';
				break;
			case 'cr':
				this.jql = this.config.cr;
				this.title = 'Code Review';
				break;
			case 'qa':
				this.jql = this.config.qa;
				this.title = 'QA';
				break;
			case 'uctready':
				this.jql = this.config.uctready;
				this.title = 'UCT Ready';
				break;
			case 'allmy':
				this.jql = this.config.allmy;
				this.title = 'All My';
				break;
			case 'allopen':
				this.jql = this.config.allopen;
				this.title = 'All Open';
				break;
			case 'teamdb_ember':
				this.jql = this.config.teamdb_ember;
				this.title = 'TeamDB Ember';
				break;
			case 'apollo':
				this.jql = this.config.apollo;
				this.title = 'Apollo';
				break;
			case 'sme':
				this.jql = this.config.sme;
				this.title = 'SME';
				break;
			case 'scrum':
				this.jql = this.config.scrum;
				this.title = 'Scrum Board';
				break;
			case 'fullscrum':
				this.jql = this.config.fullScrum;
				this.title = 'Full Scrum Board';
				break;
			case 'rocc':
				this.jql = this.config.rocc;
				this.title = 'ROCC Automation';
				break;
			case 'starship':
				this.jql = this.config.starship;
				this.title = 'Starship';
				break;
			case 'rds':
				this.jql = this.config.rds;
				this.title = 'RDS';
				break;
			case 'pm':
				this.jql = this.config.pmTickets;
				this.title = 'PM';
				break;
			case 'roccathon':
				this.jql = this.config.roccathonTickets;
				this.title = 'Roccathon';
				break;
			case 'orchestration':
				this.jql = this.config.orchestration;
				this.title = 'Orchestration';
				break;
			case 'innovation':
				this.jql = this.config.innovation;
				this.title = 'Innovation Express';
				break;
			case 'cart':
				this.jql = this.config.cartProject;
				this.title = 'CART';
				break;
			case 'sable':
				this.jql = this.config.sable;
				this.title = 'SABLE';
				break;
			case 'apiud':
				this.jql = this.config.apiTeamAccelerate;
				this.title = 'API Team Accelerate';
				break;
			default:
				this.jql = this.config.mytickets;
				this.title = 'My Open';

				// if loading for the first time and 
				// loading my ticket then just try to load locally
				if(this.firstLoad){
					this.firstLoad = false;
					const data = this.lStore.getItem('mytickets');

					if(data){
						// first load locally then call for fresh data as well
						// return Observable.of({data:JSON.parse(data), cached: true})
	  			// 		.concat(this.api.getAPI(`${this.apiUrl}/jira/tickets?jql=${this.jql}&fields=${this.config.fields}`));
					}
				}
		}

		this.firstLoad = false;
		return this.api.getAPI(`${this.apiUrl}/jira/tickets?jql=${this.jql}&fields=${this.config.fields}`);
	}

	/*
	*/
	setPing({key, ping_type}): Observable<any> {
		return this.api.postAPI({
			url: `${this.apiUrl}/chat/send_ping`,
			body: { key, ping_type, username: this.user.username }
		});
	}

	/*
	*/
	getATicketDetails(key){
		const jql = `key%3D%20${key}`
		return this.api.getAPI(`${this.apiUrl}/jira/tickets?jql=${jql}`);
	}

	/*
	*/
	searchTicket(msrp:string): Observable<any> {
		return this.api.getAPI(`${this.apiUrl}/jira/getkey/${msrp}`);
	}

	/*
	*/
	getTicketBranches(msrp:string): Observable<any> {
		return this.api.getAPI(`${this.apiUrl}/git/branches/${msrp}`);
	}

	/*
	*/
	getRepos(): Observable<any>{
		return this.api.getAPI(`${this.apiUrl}/git/repos`);
	}

	/*
	*/
	generateQA(postData): Observable<any> {

		// add creds
		postData.username = this.user.username;
		postData.password = this.user.password;

		let sources = [];

		// create crucible and post comment
		return this.api.postAPI({
			url: `${this.apiUrl}/crucible/create`,
			body: postData
		})
	}

	/*
	*/
	getBranches(repoName): Observable<any> {
		return this.api.getAPI(`${this.apiUrl}/git/repo/${repoName}`);
	}

	/*
	*/
	workLog(postData): Observable<any> {
		return this.api.postAPI({
			url: `${this.apiUrl}/jira/comment`,
			body: postData
		});
	}

	/*
	*/
	editComment(postData): Observable<any> {
		return this.api.putAPI({
			url: `${this.apiUrl}/jira/comment`,
			body: postData
		});
	}

	/*
	*/
	deleteComment(comment_id, key): Observable<any> {
		return this.api.deleteAPI({
			url: `${this.apiUrl}/jira/comment?comment_id=${comment_id}&key=${key}`
		});
	}

	/*
	*/
	changeStatus(postData): Observable<any> {
		postData.username = this.user.username;
		
		return this.api.postAPI({
			url: `${this.apiUrl}/jira/status`,
			body: postData
		});
	}

	/*
	*/
	getProfile(): Observable<any> {
		return this.api.getAPI(`${this.apiUrl}/jira/profile`);
	}

	/*
	*/
	public processErrorResponse(response:HttpErrorResponse): string {
		return response.error.data || response.message || response.error;
	}

}
