import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NgRedux } from '@angular-redux/store';

import { UserService } from './user.service';
import { ConfigService } from './config.service';
import { DataService } from './data.service';

import { RootState, Actions } from '@store';
import { APIResponse } from '@models';

@Injectable()
export class JiraService {

	constructor(
		public dataService:DataService, public config:ConfigService, 
		public user:UserService, public store:NgRedux<RootState>
	) {}

	/**
	 * gets a ticket filter's list of tickets.
	 * @param {string} filterName the name of the filter to get tickets from.
	 * @param {Boolean=false} isHardRefresh a hard refresh skips the cache and only gets from the API.
	 */
	getTickets(filterName:string, isHardRefresh:Boolean=false, jql): Observable<any> {
		let params = new HttpParams();
		params = params.append('jql', jql);
		params = params.append('fields', this.config.fields);
		params = params.append('isHardRefresh', isHardRefresh.toString());

		return this.dataService.get(`${this.dataService.apiUrl}/jira/tickets`, {params});
	}

	/**
	 * Gets extra details about a Jira ticket
	 * @param {string} key the Jira ticket key to get details from
	 * @return {Observable} 
	 */
	getATicketDetails(key: string): Observable<any>{
		let params = new HttpParams();
		params = params.append('jql', `key%3D%20${key}`);
		return this.dataService.get(`${this.dataService.apiUrl}/jira/tickets`, {params});
	}

	/**
	 * get all tickets for a sprint
	 */
	getSprint(sprint:string, isHardRefresh:Boolean=false){
		const sprintJql = this.config.sprintJql(sprint);
		
		let params = new HttpParams();
		params = params.append('jql', sprintJql);
		params = params.append('fields', this.config.fields);
		params = params.append('isHardRefresh', isHardRefresh.toString());

		return this.dataService.get(`${this.dataService.apiUrl}/jira/tickets`, {params});
	}

	/**
	 * Searches for the key of a Jira ticket given its MSRP
	 * @param {string} msrp the Jira ticket msrp
	 * @return {Observable} 
	 */
	searchTicket(msrp:string): Observable<any> {
		let params = new HttpParams();
		params = params.append('isHardRefresh', `true`);
		return this.dataService.get(`${this.dataService.apiUrl}/jira/getkey/${msrp}`, {params});
	}

	/**
	 * Generates QA fields - code cloud review, Jira comment, Log time, and state transition to PCR
	 * @param {Object} postData
	 * @return {Observable} 
	 */
	generateQA(postData: any): Observable<any> {
		postData.username = this.user.username;
		return this.dataService.post(`${this.dataService.apiUrl}/codecloud/create`, postData);
	}

	/**
	 * Changes a Jira ticket's status
	 * @param {Object} postData
	 * @return {Observable} 
	 */
	changeStatus(postData: any): Observable<any> {
		postData.username = this.user.username;
		return this.dataService.post(`${this.dataService.apiUrl}/jira/status`, postData);
	}

	/**
	 * gets a list of active sprints
	 * @return {Observable} 
	 */
	getActiveSprints() {
		this.dataService.get(`${this.dataService.apiUrl}/jira/active_sprints`)
		.subscribe(
			sprint => this.store.dispatch({type: Actions.activeSprints, payload: sprint.data}),
			this.dataService.processErrorResponse
		);
	}
	
	/**
	 * Processes an httpClient error response
	 * @param {} message
	 * @return {string} 
	 */
	processErrorResponse(message: any): string{
		return this.dataService.processErrorResponse(message);
	}
}