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
		const podNames = this.config.podNames.filter(ticketData=>ticketData.link===filterName);

		// see which array came back with data
		const ticketListData = allProjectNames[0] || teamTicketListNames[0] || otherTicketListNames[0] || podNames[0];

		// set JQL and title if found match or default to my ticket
		const jql = ticketListData ? this.config[ticketListData.link] : this.config.mytickets;
		const title = ticketListData ? ticketListData.displayName : this.config.teamTicketListNames[0].displayName;

		return {jql, title};
	}

	/**
	 * gets a ticket filter's list of tickets and dispatches the 
	 * http response to the Redux store on success.
	 * @param {string} filterName the name of the filter to get tickets from.
	 * @param {Boolean=false} isHardRefresh a hard refresh skips the cache and only gets from the API.
	 */
	getTickets(filterName:string, isHardRefresh:Boolean=false): Observable<any> {
		const {jql, title} = this._getFilterTitleAndJql(filterName);
		this.title = title;

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
	getATicketDetails(key){
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
	 * Generates QA fields - Crucible review, Jira comment, Log time, and state transition to PCR
	 * @param {Object} postData
	 * @return {Observable} 
	 */
	generateQA(postData): Observable<any> {

		// add creds to POST data
		postData.username = this.user.username;
		postData.password = this.user.password;

		// create crucible and post comment
		return this.dataService.post(`${this.dataService.apiUrl}/crucible/create`, postData);
	}

	/**
	 * Changes a Jira ticket's status
	 * @param {Object} postData
	 * @return {Observable} 
	 */
	changeStatus(postData): Observable<any> {
		postData.username = this.user.username;
		return this.dataService.post(`${this.dataService.apiUrl}/jira/status`, postData);
	}

	
	/**
	 * Processes an httpClient error response
	 * @param {} message
	 * @return {string} 
	 */
	processErrorResponse(message){
		return this.dataService.processErrorResponse(message);
	}
}