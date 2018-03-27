import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UserService } from './../user.service';
import { DataService } from './../data.service';

import { APIResponse } from '@models';

@Injectable()
export class JiraWatchersService {
	apiUrl:string = 'jira/watchers';

	constructor(public dataService:DataService, public user:UserService) { }

	/**
	 * Gets all watchers for a Jira ticket.
	 * @param {string} key the jira key to get all watchers from
	 * @return {Observable} the response from the watcher action
	 */
	public getWatchers(key): Observable<APIResponse> {
		return this.dataService.get( this._generateUrl(key) );
	}

	/**
	 * Adds a watchers for a Jira ticket.
	 * @param {string} key the jira key to add the watcher to
	 * @return {Observable} the response from the watcher action
	 */
	public addWatcher(key): Observable<APIResponse> {
		return this.dataService.post( this._generateUrl(key) );
	}

	/**
	 * Removes a watchers for a Jira ticket
	 * @param {string} key the jira key to remove the watcher from
	 * @return {Observable} the response from the watcher action
	 */
	public removeWatcher(key): Observable<APIResponse> {
		return this.dataService.delete( this._generateUrl(key) );
	}

	/**
	 * Generates the URL for a watcher API action.
	 * @param {string} key the jira key
	 * @return {string} the URL of the watcher Action
	 */
	private _generateUrl(key):string {
		const username = this.user.username;
		return `${this.dataService.apiUrl}/${this.apiUrl}/${key}/${username}`;
	}

	/**
	 *
	 */
	processErrorResponse(message){
		return this.dataService.processErrorResponse(message);
	}
}
