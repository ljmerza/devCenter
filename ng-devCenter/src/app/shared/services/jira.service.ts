import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user.service';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage.service';
import { ToastrService } from './toastr.service';

import { NgRedux } from '@angular-redux/store';
import { RootState } from './../store/store';
import { Actions } from './../store/actions';


import { environment } from '../../../environments/environment';

@Injectable()
export class JiraService {
	title:string = '';
	jql:string=''
	firstLoad = true;

	/**
	*/
	constructor(
		public http:HttpClient, public config:ConfigService,
		public lStore:LocalStorageService, public toastr:ToastrService,
		public user:UserService, public ngRedux:NgRedux<RootState>
	) { }

	apiUrl:string = `${environment.apiUrl}:${environment.port}/dev_center`;

	/**
	*/
	getTickets(jiraListType:string, isHardRefresh:Boolean=false):void {
		// try to get ticket list data
		const allProjectNames = this.config.allProjectNames.filter(ticketData=>ticketData.link===jiraListType);
		const teamTicketListNames = this.config.teamTicketListNames.filter(ticketData=>ticketData.link===jiraListType);
		const otherTicketListNames = this.config.otherTicketListNames.filter(ticketData=>ticketData.link===jiraListType);

		// see which array came back with data
		const ticketListData = allProjectNames[0] || teamTicketListNames[0] || otherTicketListNames[0];

		// set JQL and title if found match or default to my ticket
		this.jql = ticketListData ? this.config[ticketListData.link] : this.config.mytickets;
		this.title = ticketListData ? ticketListData.displayName : this.config.teamTicketListNames[0].name;

		// set url params
		let params = new HttpParams();
		params = params.append('jql', this.jql);
		params = params.append('fields', this.config.fields);
		params = params.append('isHardRefresh', isHardRefresh.toString());

		// get tickets and save in store
		this.http.get(`${this.apiUrl}/jira/tickets`, {params})
		.subscribe( 
			(response:any) => {
				if(response){
					this.ngRedux.dispatch({type: Actions.newTickets, payload: response.data });
				}
			},
			this.processErrorResponse.bind(this)
		);
	}

	/**
	*/
	setPing({key, ping_type}): Observable<any> {
		const postData = { key, ping_type, username: this.user.username };
		return this.http.post(`${this.apiUrl}/chat/send_ping`, postData);
	}

	/**
	*/
	getATicketDetails(key){
		let params = new HttpParams();
		params = params.append('jql', `key%3D%20${key}`);
		return this.http.get(`${this.apiUrl}/jira/tickets`, {params});
	}

	/**
	*/
	searchTicket(msrp:string): Observable<any> {
		let params = new HttpParams();
		params = params.append('isHardRefresh', `true`);
		return this.http.get(`${this.apiUrl}/jira/getkey/${msrp}`, {params});
	}

	/**
	*/
	getTicketBranches(msrp:string): Observable<any> {
		let params = new HttpParams();
		params = params.append('isHardRefresh', `true`);
		return this.http.get(`${this.apiUrl}/git/branches/${msrp}`, {params});
	}

	/**
	*/
	getRepos():void {
		this.http.get(`${this.apiUrl}/git/repos`)
		.subscribe( 
			(response:any) => {
				console.log('git', response)
				if(response) {
					this.ngRedux.dispatch({type: Actions.repos, payload: response.data });
				}
			},
			this.processErrorResponse.bind(this)

		);
	}

	/**
	*/
	generateQA(postData): Observable<any> {

		// add creds to POST data
		postData.username = this.user.username;
		postData.password = this.user.password;

		// create crucible and post comment
		return this.http.post(`${this.apiUrl}/crucible/create`, postData);
	}

	/**
	*/
	getBranches(repoName): Observable<any> {
		let params = new HttpParams();
		params = params.append('isHardRefresh', `true`);
		return this.http.get(`${this.apiUrl}/git/repo/${repoName}`, {params});
	}

	/**
	*/
	workLog(postData): Observable<any> {
		return this.http.post(`${this.apiUrl}/jira/comment`, postData);
	}

	/**
	*/
	editComment(postData): Observable<any> {
		return this.http.put(`${this.apiUrl}/jira/comment`, postData);
	}

	/**
	*/
	deleteComment(comment_id, key): Observable<any> {
		let params = new HttpParams();
		params = params.append('comment_id', comment_id);
		params = params.append('key', key);
		return this.http.delete(`${this.apiUrl}/jira/comment`, {params});
	}

	/**
	*/
	changeStatus(postData): Observable<any> {
		postData.username = this.user.username;
		return this.http.post(`${this.apiUrl}/jira/status`, postData);
	}

	/**
	*/
	getProfile(): Observable<any> {
		return this.http.get(`${this.apiUrl}/jira/profile/${this.user.username}`);
	}

	/**
	*/
	setPingSettings(postData): Observable<any> {
		postData.username = this.user.username;
		return this.http.post(`${this.apiUrl}/chat/user_pings`, postData);
	}

	/**
	*/
	public processErrorResponse(response:HttpErrorResponse):string {
		console.log('error',response)
		const message = response.error.data || response.message || response.error;
		this.toastr.showToast(message, 'error');
		return message;
	}

}
