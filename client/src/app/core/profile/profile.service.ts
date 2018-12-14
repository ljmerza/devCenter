import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';

import { selectSettings } from '@app/settings/settings.selectors';
import { environment as env } from '@env/environment';

@Injectable()
export class ProfileService {
    private settings$: Subscription;
    settings;

    constructor(private httpClient: HttpClient, public store: Store<{}>) {
        this.settings$ = this.store.pipe(select(selectSettings))
            .subscribe(settings => (this.settings = settings));
    }

	/**
	 * gets a user's Jira profile and on success, stores it in the Redux store.
	 */
    getProfile(): Observable<any> {
        return this.httpClient.get(`${env.apiUrl}/jira/profile/${this.settings.username}`);
    }
}
