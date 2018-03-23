import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LocalStorageService } from './local-storage.service';
import { ToastrService } from './toastr.service';
import { environment } from '@environment';

@Injectable()
export class DataService extends HttpClient {
	apiUrl:string = `${environment.apiUrl}:${environment.port}/dev_center`;

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
			.set('Authorization',  this._authorizationHeader() )
			.set('Content-Type', 'application/json');
	}

	/**
	*/
	private _authorizationHeader(): string {
		const username = this.ls.getItem('username');
		let password = this.ls.getItem('password');

		try {
			password = atob(password);
			return "Basic " + btoa(`${username}:${password}`);
		}catch(e){
			return '';
		}
	}

	get(url, options:any={}): Observable<any>{
		options.headers = this._createHeaders();
		return super.get(url, options);
	}

	post(url, body?, options:any={}): Observable<any>{
		options.headers = this._createHeaders();
		return super.post(url, body, options);
	}

	put(url, body?, options:any={}): Observable<any>{
		options.headers = this._createHeaders();
		return super.put(url, body, options);
	}

	delete(url, options:any={}): Observable<any>{
		options.headers = this._createHeaders();
		return super.delete(url, options);
	}

}
