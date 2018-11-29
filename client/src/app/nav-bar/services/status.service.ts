import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment as env } from '@env/environment';

@Injectable()
export class NavBarStatusService {
    constructor(private httpClient: HttpClient) { }

	/**
	 * gets all statuses for a user
	 */
    getStatuses(): Observable<any> {
        return this.httpClient.get(`${env.apiUrl}/skipcreds/statuses`);
    }
}
