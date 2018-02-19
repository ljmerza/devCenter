import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpParams, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user.service';
import { ToastrService } from './toastr.service';
import { DataService } from './data.service';

import { APIResponse } from './../../shared/store/models/apiResponse';

@Injectable()
export class ProfileService {
	title:string = '';

	constructor(private dataService:DataService, public user:UserService) {}

	/**
	 * gets a user's Jira profile and on success, stores it in the Redux store.
	 */
	getProfile(): Observable<any> {
		return this.dataService.get(`${this.dataService.apiUrl}/jira/profile/${this.user.username}`)
	}

	/**
	 *
	 */
	processErrorResponse(error){
		this.dataService.processErrorResponse(error);
	}

}
