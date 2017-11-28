import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user.service'

import config from './config'
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/map';

import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class DataService {

	apiUrl:string = `${environment.apiUrl}:5858/dev_center`;

	constructor(
		public http:HttpClient, 
		public user:UserService, 
		public sanitizer: DomSanitizer
	) { }

	/*
	*/
	public chatUrlSanitize(username:string): SafeUrl {
		return this.sanitizer.bypassSecurityTrustUrl(`${config.chatUrl}/${username}`)
	}

	/*
	*/
	public getAPI(url:string): Observable<any> {
		return this.http.get(url, { headers: this.createHeaders() });
	}

	/*
	*/
	public postAPI(args): Observable<any> {
		return this.http.post(args.url, args.body, { headers: this.createHeaders() })
	}

	/*
	*/
	private createHeaders() {
		return new HttpHeaders()
			.set('Authorization', this.authorizationHeader() )
			.set('Content-Type', 'application/json');
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
	public processErrorResponse(response:HttpErrorResponse): string {
		console.log('response: ', response);
		return response.error.data || response.message || response.error;
	}
}
