import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { NgRedux } from '@angular-redux/store';

import { RootState, Actions } from '@store';
import { DataService } from './data.service';

@Injectable()
export class GitService {
	title:string = '';

	constructor(private dataService:DataService, private store:NgRedux<RootState>) {}

	/**
	 * gets a Jira ticket's related Git branches.
	 * @param {string} mrsp the msrp of the ticket to get Git info from.
	 */
	getTicketBranches(msrp:string): Observable<any> {
		let params = new HttpParams();
		params = params.append('isHardRefresh', `true`);
		return this.dataService.get(`${this.dataService.apiUrl}/git/branches/${msrp}`, {params});
	}

	/**
	 * gets all valid Repos from Crucible.
	 */
	getRepos() {
		this.dataService.get(`${this.dataService.apiUrl}/git/repos`)
		.subscribe(
			repos => this.store.dispatch({type: Actions.repos, payload: repos.data}),
			this.dataService.processErrorResponse
		);
	}

	/**
	 * gets a repository's branch list.
	 * @param {string} repoName the name of the repository to get all its branches.
	 */
	getBranches(repoName:string): Observable<any> {
		let params = new HttpParams();
		params = params.append('isHardRefresh', `true`);
		return this.dataService.get(`${this.dataService.apiUrl}/git/repo/${repoName}`, {params});
	}

	processErrorResponse(message){
		return this.dataService.processErrorResponse(message);
	}

}
