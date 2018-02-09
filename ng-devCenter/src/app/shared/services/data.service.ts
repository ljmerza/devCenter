import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ToastrService } from './toastr.service';
import { environment } from '../../../environments/environment';


@Injectable()
export class DataService {
	apiUrl:string = `${environment.apiUrl}:${environment.port}/dev_center`;
	
	constructor(public toastr:ToastrService) { }

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
