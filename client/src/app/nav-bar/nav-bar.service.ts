import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';

import { environment as env } from '@env/environment';
import { selectSettings } from '@app/settings/settings.selectors';

@Injectable()
export class NavBarService {
	private settings$: Subscription;
  	settings;

  	constructor(private httpClient: HttpClient, public store: Store<{}>) {
  		this.settings$ = this.store.pipe(select(selectSettings))
      		.subscribe(settings => (this.settings = settings));
  	}

  	retrieveNavBar(): Observable<any> {
    	return this.httpClient.get(`${env.apiUrl}/skipcreds/navbar`);
  	}

  	/**
	 * Searches for the key of a Jira ticket given its MSRP
	 * @param {string} msrp the Jira ticket msrp
	 * @return {Observable} 
	 */
	findJiraTicket(msrp:string): Observable<any> {
		return this.httpClient.get(`${env.apiUrl}/jira/getkey/${msrp}`);
	}

	/**
	 * gets a user's Jira profile and on success, stores it in the Redux store.
	 */
	getProfile(): Observable<any> {
		return this.httpClient.get(`${env.apiUrl}/jira/profile/${this.settings.username}`)
	}
}
