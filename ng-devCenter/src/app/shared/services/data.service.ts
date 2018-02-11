import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';

import { LocalStorageService } from '../services/local-storage.service';
import { ToastrService } from './toastr.service';
import { environment } from '../../../environments/environment';


@Injectable()
export class DataService extends HttpClient {
	apiUrl:string = `${environment.apiUrl}:${environment.port}/dev_center`;
	user;

	constructor(public toastr:ToastrService, public httpHandler:HttpHandler, private ls:LocalStorageService) {
		super(httpHandler);
	}

	/**
	 * processes a thrown observable httpClient response to show toastr error notification.
	 * @param {HttpErrorResponse} response
	 */
	public processErrorResponse(response:HttpErrorResponse):string {
		let responseError = response.error ? response.error.data : null; 
		responseError = responseError || response.message || response.error;

		if(!this.toastr) return responseError;

		this.toastr.showToast(responseError, 'error');
		return responseError;
	}

	private _createHeaders() {
		return new HttpHeaders()
			.set('Authorization', this._authorizationHeader() )
			.set('Content-Type', 'application/json');
	}

	/**
	*/
	private _authorizationHeader(): string {
		const username = this.ls.getItem('username');
		const password = this.ls.getItem('password');

		try {
			return "Basic " + btoa(`${this.user.username}:${this.user.password}`);
		}catch(e){
			return '';
		}
	}

}
