import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {environment as env} from '@env/environment';
import {Observable} from 'rxjs';

@Injectable()
export class SettingsService {
	redirectUrl = '';

	constructor(private httpClient: HttpClient) {}

	encryptPassword(password): Observable<any> {
		return this.httpClient.post(`${env.apiUrl}/skipcreds/encrypt`, {password});
	}
}
