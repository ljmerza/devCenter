import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NgRedux } from '@angular-redux/store';

import { UserService } from './../user.service';
import { DataService } from './../data.service';

import { RootState, Actions } from '@store';
import { APIResponse } from '@models';

@Injectable()
export class JiraPingsService {

	constructor(public dataService:DataService, public user:UserService, public store:NgRedux<RootState>) {}

  	/**
  	 * send a new or merge ticket ping to the logged in user.
  	 * @param {string} the key of the Jria ticket the user wants pinged
  	 * @param {string} pingType the type of ping to send (new or merge)
	 * @return {Observable} the http observable
	 */
	setPing({key, pingType}): Observable<any> {
		const postData = { key, ping_type:pingType, username: this.user.username };
		const resp$ = this.dataService.post(`${this.dataService.apiUrl}/chat/send_ping`, postData)
		resp$.subscribe(
 			response => {},
			this.dataService.processErrorResponse.bind(this.dataService)
		);
		return resp$;
	}

	/**
	 * sets a users ping settings (ie new ticket ping, merge ticket ping, etc)
	 * @param {Object} postData an object with the type of ping setting to set
	 * @return {Observable} the http observable
	 */
	setPingSettings(postData): Observable<any> {
		postData.username = this.user.username;
		const resp$ =  this.dataService.post(`${this.dataService.apiUrl}/chat/user_pings`, postData);
		resp$.subscribe(
 			response => {},
			this.dataService.processErrorResponse.bind(this.dataService)
		);
		return resp$;
	}

}
