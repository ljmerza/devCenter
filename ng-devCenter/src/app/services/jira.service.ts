import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
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
		public user:UserService
	) { }

	apiUrl:string = `${environment.apiUrl}:${environment.port}/dev_center`;

	/**
	*/
	getFilterData(jiraListType:string, skipCache:boolean=false): Observable<any> {

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
		}

		this.firstLoad = false;

		let params = new HttpParams();
		params = params.append('jql', this.jql);
		params = params.append('fields', this.config.fields);
		params = params.append('skipCache', skipCache.toString());
		return this.http.get(`${this.apiUrl}/jira/tickets`, {params});
	}

	/*
	*/
	setPing({key, ping_type}): Observable<any> {
		const postData = { key, ping_type, username: this.user.username };
		return this.http.post(`${this.apiUrl}/chat/send_ping`, postData);
	}

	/*
	*/
	getATicketDetails(key){
		let params = new HttpParams();
		params = params.append('jql', `key%3D%20${key}`);
		return this.http.get(`${this.apiUrl}/jira/tickets`, {params});
	}

	/*
	*/
	searchTicket(msrp:string): Observable<any> {
		return this.http.get(`${this.apiUrl}/jira/getkey/${msrp}`);
	}

	/*
	*/
	getTicketBranches(msrp:string): Observable<any> {
		return this.http.get(`${this.apiUrl}/git/branches/${msrp}`);
	}

	/*
	*/
	getRepos(): Observable<any>{
		return this.http.get(`${this.apiUrl}/git/repos`);
	}

	/*
	*/
	generateQA(postData): Observable<any> {

		// add creds to POST data
		postData.username = this.user.username;
		postData.password = this.user.password;

		// create crucible and post comment
		return this.http.post(`${this.apiUrl}/crucible/create`, postData);
	}

	/*
	*/
	getBranches(repoName): Observable<any> {
		return this.http.get(`${this.apiUrl}/git/repo/${repoName}`);
	}

	/*
	*/
	workLog(postData): Observable<any> {
		return this.http.post(`${this.apiUrl}/jira/comment`, postData);
	}

	/*
	*/
	editComment(postData): Observable<any> {
		return this.http.put(`${this.apiUrl}/jira/comment`, postData);
	}

	/*
	*/
	deleteComment(comment_id, key): Observable<any> {
		let params = new HttpParams();
		params = params.append('comment_id', comment_id);
		params = params.append('key', key);
		return this.http.get(`${this.apiUrl}/jira/comment`, {params});
	}

	/*
	*/
	changeStatus(postData): Observable<any> {
		postData.username = this.user.username;
		return this.http.post(`${this.apiUrl}/jira/status`, postData);
	}

	/*
	*/
	getProfile(): Observable<any> {
		return this.http.get(`${this.apiUrl}/jira/profile`);
	}

	/*
	*/
	public processErrorResponse(response:HttpErrorResponse): string {
		return response.error.data || response.message || response.error;
	}

}
