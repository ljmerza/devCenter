import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserService } from './user.service';
import { DataService } from './data.service';

@Injectable()
export class ProfileService {
	title:string = '';

	constructor(private dataService:DataService, public user:UserService) {}

	/**
	 * gets a user's Jira profile and on success, stores it in the Redux store.
	 */
	getProfile(): Observable<any> {
		let params = new HttpParams();
   		params = params.append('isHardRefresh', `true`);
		return this.dataService.get(`${this.dataService.apiUrl}/jira/profile/${this.user.username}`, {params})
	}

	/**
	 * @param {string} error
	 */
	processErrorResponse(error, optionalMessage){
		this.dataService.processErrorResponse(error, optionalMessage);
	}
}
