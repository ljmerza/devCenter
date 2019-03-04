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

    public get devBaseUrl(): string {
        return `http://${this.settings.devServer}.${env.rootDomain}:${this.settings.port}`;
    }

    public get emberBaseUrl(): string {
        const isLocalUrl = this.settings.emberUrl === 'local';
        const port = isLocalUrl ? '4200' : this.settings.port;
        const hash = isLocalUrl ? '/#' : '';
        const server = isLocalUrl ? 'localhost' : `${this.settings.devServer}.${env.rootDomain}`;
        return `http://${server}:${port}/UD-ember${hash}`;
    }

    public get teamBaseUrl(): string {
        const isLocalUrl = this.settings.teamUrl === 'local';
        const port = isLocalUrl ? '4200' : this.settings.port;
        const hash = isLocalUrl ? '/#' : '';
        const server = isLocalUrl ? 'localhost' : `${this.settings.devServer}.${env.rootDomain}`;

        return `http://${server}:${port}/${hash}`;
    }

    public get templateBaseUrl(): string {
        const isLocalUrl = this.settings.tempUrl === 'local';
        const port = isLocalUrl ? '4200' : this.settings.port;
        const hash = isLocalUrl ? '/#' : '';
        const server = isLocalUrl ? 'localhost' : `${this.settings.devServer}.${env.rootDomain}`;

        return `http://${server}:${port}/templatetools/${hash}`;
    }
}
