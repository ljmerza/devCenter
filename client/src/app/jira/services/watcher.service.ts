import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '@env/environment';

@Injectable()
export class WatcherService {
    constructor(public httpClient: HttpClient) { }

	/**
	 * Gets all watchers for a Jira ticket.
	 * @param {string} key the jira key to get all watchers from
	 * @return {Observable} the response from the watcher action
	 */
    public getWatchers({ key, username }): Observable<any> {
        return this.httpClient.get(`${env.apiUrl}/jira/watchers/${key}/${username}`);
	}

	/**
	 * Adds a watchers for a Jira ticket.
	 * @param {string} key the jira key to add the watcher to
	 * @return {Observable} the response from the watcher action
	 */
    public addWatcher({ key, username }): Observable<any> {
        return this.httpClient.post(`${env.apiUrl}/jira/watchers/${key}/${username}` , {});
	}

	/**
	 * Removes a watchers for a Jira ticket
	 * @param {string} key the jira key to remove the watcher from
	 * @return {Observable} the response from the watcher action
	 */
	public removeWatcher({key, username}): Observable<any> {
        return this.httpClient.delete(`${env.apiUrl}/jira/watchers/${key}/${username}`);
	}
}
