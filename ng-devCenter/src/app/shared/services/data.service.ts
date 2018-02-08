import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user.service';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage.service';
import { ToastrService } from './toastr.service';

import { NgRedux } from '@angular-redux/store';
import { RootState } from './../store/store';

import { environment } from '../../../environments/environment';


@Injectable()
export class DataService {
	apiUrl:string = `${environment.apiUrl}:${environment.port}/dev_center`;
	
	constructor(
		public http:HttpClient, public config:ConfigService,
		public toastr:ToastrService,
		public user:UserService, public store:NgRedux<RootState>
	) { }

	/**
	 * processes a thrown observable httpClient response to show toastr error notification.
	 * @param {HttpErrorResponse} response
	 */
	public processErrorResponse(response:HttpErrorResponse):string {
		const message = response.error.data || response.message || response.error;
		this.toastr.showToast(message, 'error');
		return message;
	}

}
