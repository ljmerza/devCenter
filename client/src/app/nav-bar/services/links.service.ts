import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment as env } from '@env/environment';

@Injectable()
export class NavBarLinksService {
    constructor(private httpClient: HttpClient) { }


	/**
	 * gets all route links for JQLs
	 */
    getLinks(): Observable<any> {
        return this.httpClient.get(`${env.apiUrl}/skipcreds/jql_links`);
    }
}
