import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { DataService } from './data.service';

import { NgRedux } from '@angular-redux/store';
import { RootState } from './../store/store';
import { Actions } from './../store/actions';

import { APIResponse } from './../../shared/store/models/apiResponse';

@Injectable()
export class GitService {
	title:string = '';

	constructor(public store:NgRedux<RootState>, private dataService:DataService) {}

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
	 * gets all valid Repos from Crucible. On success store in Redux store.
	 */
	getRepos():void {
		this.dataService.get(`${this.dataService.apiUrl}/git/repos`)
		.subscribe(
			(response:APIResponse) => {
				this.store.dispatch({type: Actions.repos, payload: response.data });
			},
			this.dataService.processErrorResponse.bind(this)
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
