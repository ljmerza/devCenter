import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user.service'
import { ToastrService } from './../services/toastr.service';

import config from './config'
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/map';

import { AppError } from './../errors/app-error';
import { FalseError } from './../errors/false-error';
import { NotFoundError } from './../errors/not-found-error';

import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class DataService {

	apiUrl:string = `${environment.apiUrl}:5858/dev_center`;

	constructor(
		public http:HttpClient, 
		public user:UserService, 
		public sanitizer: DomSanitizer, 
		public toastr: ToastrService
	) { }

	/*
	*/
	public chatUrlSanitize(username:string): SafeUrl {
		return this.sanitizer.bypassSecurityTrustUrl(`${config.chatUrl}/${username}`)
	}

	/*
	*/
	public getAPI(url:string): Observable<any> {
		const options = { 
			headers: this.createHeaders()
		};

		return this.http.get(url, options)
		.do( (response:any) => {
			if(!response.status){
				return Observable.throw(new Error(response.data));
			}
		})
		.catch(this.handleError);
	}

	/*
	*/
	public postAPI(args): Observable<any> {
		const options = { 
			headers: this.createHeaders()
		};

		return this.http.post( args.url, args.body, options )
		.do( (response:any) => {
			if(!response.status){
				return Observable.throw(new Error(response.data));
			}
		})
		.catch(this.handleError);
	}

	/*
	*/
	private createHeaders() {
		let headers = new HttpHeaders();

		headers.set('Authorization', this.authorizationHeader() );	
		headers.set('Content-Type', 'application/json');

		return headers;
	}

	/*
	*/
	private authorizationHeader(): string {
		if(this.user.username && this.user.password){
			return "Basic " + btoa(`${this.user.username}:${this.user.password}`);
		} else {
			return '';
		}
		
	} 
	
	/*
	*/
	private handleError(error:Response): Observable<any> {
		console.log('error: ', error, error.status);
		if(error.status === 404) {
 			return Observable.throw(new NotFoundError(error, this.toastr));

		} else if(typeof error.status !== 'undefined' && !error.status) {
			return Observable.throw(new FalseError(error, this.toastr));
			
		} else {
 			return Observable.throw(new AppError(error, this.toastr));
	 	}
	}
}
