import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment as env } from '@env/environment';

@Injectable()
export class BranchInfoService {
    constructor(private httpClient: HttpClient) {

    }

    /**
  	 * send a new or merge ticket ping to the logged in user.
  	 * @param {string} the key of the Jira ticket the user wants pinged
  	 * @param {string} pingType the type of ping to send (new or merge)
  	 * @param {string} epicLink 
  	 * @param {string} username 
	 * @return {Observable} the http observable
	 */
	sendPing({key, pingType, epicLink, username}): Observable<any> {
		const postData = { key, ping_type:pingType, username, epic_link: epicLink };
		return this.httpClient.post(`${env.apiUrl}/chat/send_ping`, postData);
	}
}