import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user.service';
import { ConfigService } from './config.service';
import { ToastrService } from './toastr.service';
import { DataService } from './data.service';

import { NgRedux } from '@angular-redux/store';
import { RootState } from './../store/store';
import { Actions } from './../store/actions';

import { APIResponse } from './../../shared/store/models/apiResponse';

@Injectable()
export class JiraService {
	title:string = '';

	constructor(public dataService:DataService, public config:ConfigService, public user:UserService, public store:NgRedux<RootState>) {}

	/**
	 * gets a selected ticket filter's title and JQL.
	 * @param {string} filterName the ticket filter name
	 * @return {Object} returns an object with jql and title string properties
	 */
	_getFilterTitleAndJql(filterName:string){
		// try to get ticket list data
		const allProjectNames = this.config.allProjectNames.filter(ticketData=>ticketData.link===filterName);
		const teamTicketListNames = this.config.teamTicketListNames.filter(ticketData=>ticketData.link===filterName);
		const otherTicketListNames = this.config.otherTicketListNames.filter(ticketData=>ticketData.link===filterName);

		// see which array came back with data
		const ticketListData = allProjectNames[0] || teamTicketListNames[0] || otherTicketListNames[0];

		// set JQL and title if found match or default to my ticket
		const jql = ticketListData ? this.config[ticketListData.link] : this.config.mytickets;
		const title = ticketListData ? ticketListData.displayName : this.config.teamTicketListNames[0].name;

		return {jql, title};
	}

	/**
	 * gets a ticket filter's list of tickets and dispatches the 
	 * http response to the Redux store on success.
	 * @param {string} filterName the name of the filter to get tickets from.
	 * @param {Boolean=false} isHardRefresh a hard refresh skips the cache and only gets from the API.
	 */
	getTickets(filterName:string, isHardRefresh:Boolean=false):void {
		const {jql, title} = this._getFilterTitleAndJql(filterName);
		this.title = title;

		let params = new HttpParams();
		params = params.append('jql', jql);
		params = params.append('fields', this.config.fields);
		params = params.append('isHardRefresh', isHardRefresh.toString());

		this.dataService.get(`${this.dataService.apiUrl}/jira/tickets`, {params})
		.subscribe( 
			(response:APIResponse) => {
				this.store.dispatch({type: Actions.newTickets, payload: response.data});
			},
			this.dataService.processErrorResponse.bind(this)
		);
	}

	/**
	*/
	setPing({key, ping_type}): Observable<any> {
		const postData = { key, ping_type, username: this.user.username };
		return this.dataService.post(`${this.dataService.apiUrl}/chat/send_ping`, postData);
	}

	/**
	*/
	getATicketDetails(key){
		let params = new HttpParams();
		params = params.append('jql', `key%3D%20${key}`);
		return this.dataService.get(`${this.dataService.apiUrl}/jira/tickets`, {params});
	}

	/**
	*/
	searchTicket(msrp:string): Observable<any> {
		let params = new HttpParams();
		params = params.append('isHardRefresh', `true`);
		return this.dataService.get(`${this.dataService.apiUrl}/jira/getkey/${msrp}`, {params});
	}



	/**
	*/
	generateQA(postData): Observable<any> {

		// add creds to POST data
		postData.username = this.user.username;
		postData.password = this.user.password;

		// create crucible and post comment
		return this.dataService.post(`${this.dataService.apiUrl}/crucible/create`, postData);
	}

	/**
	*/
	workLog(postData): Observable<any> {
		return this.dataService.post(`${this.dataService.apiUrl}/jira/comment`, postData);
	}

	/**
	 * deletes a comment from a ticket and updates the store
	 * @param {Comment} postData new comment skeleton object to add to ticket
	 */
	editComment(postData) {
		return this.dataService.put(`${this.dataService.apiUrl}/jira/comment`, postData);
	}

	/**
	 * deletes a comment from a ticket and updates the store
	 * @param {String} comment_id the id of the comment to delete
	 * @param {String} key the key of the ticket
	 */
	deleteComment(commentId, key) {
		let params = new HttpParams();
		params = params.append('comment_id', commentId);
		params = params.append('key', key);

		return this.dataService.delete(`${this.dataService.apiUrl}/jira/comment`, {params});
	}

	/**
	*/
	changeStatus(postData): Observable<any> {
		postData.username = this.user.username;
		return this.dataService.post(`${this.dataService.apiUrl}/jira/status`, postData);
	}

	

	/**
	*/
	setPingSettings(postData): Observable<any> {
		postData.username = this.user.username;
		return this.dataService.post(`${this.dataService.apiUrl}/chat/user_pings`, postData);
	}

	processErrorResponse(message){
		return this.dataService.processErrorResponse(message);
	}
}
