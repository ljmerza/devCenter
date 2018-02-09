import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user.service';
import { ToastrService } from './toastr.service';
import { DataService } from './data.service';

import { NgRedux } from '@angular-redux/store';
import { RootState } from './../store/store';
import { Actions } from './../store/actions';

import { APIResponse } from './../../shared/store/models/apiResponse';

@Injectable()
export class ProfileService extends DataService {
	title:string = '';

	constructor(public http:HttpClient, public toastr:ToastrService, public user:UserService, public store:NgRedux<RootState>) {
		super(toastr);
	}

	/**
	 * gets a user's Jira profile and on success, stores it in the Redux store.
	 */
	getProfile():void {
		 this.http.get(`${this.apiUrl}/jira/profile/${this.user.username}`)
		.subscribe( 
			(response:any) => {
				// save profile to user service
				const profile = response.data;
				this.user.userData = profile;
				this.user.userPicture = profile.avatarUrls['48x48'];
				
				// notify store of user profile saved
				this.store.dispatch({type: Actions.userProfile, payload: response.data });
			},
			this.processErrorResponse.bind(this)
		);
	}

}
