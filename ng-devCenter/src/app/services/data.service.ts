import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user.service'

import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/map';

import { AppError } from './../errors/app-error';
import { NotFoundError } from './../errors/not-found-error';

import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class DataService {

	jiraUrl:string = 'https://jira.web.att.com:8443';
	crucibleUrl:string = 'https://icode3.web.att.com';
	codeCloudUrl:string = 'https://codecloud.web.att.com';

	apiUrl:string = 'http://localhost:5858/dev_center';

	devUrl:string = 'http://m5devacoe01.gcsc.att.com';
	betaUrl:string = 'http://chrapud16b.gcsc.att.com';
	wikiUrl:string = 'https://wiki.web.att.com';

	chatUrl = 'qto://talk';

	chatUrlSanitize(username:string){
		return this.sanitizer.bypassSecurityTrustUrl(`${this.chatUrl}/${username}`)
	}


	/*
	*/
	constructor(public http:Http, public user:UserService, public sanitizer: DomSanitizer) { }

	/*
	*/
	authorizationHeader() {
		if(this.user.username && this.user.password){
			return "Basic " + btoa(`${this.user.username}:${this.user.password}`);
		} else {
			return '';
		}
		
	} 
	
	/*
	*/
	private handleError(error:Response){
		if(error.status === 404)
 			return Observable.throw(new NotFoundError(error));
	 	else
 			return Observable.throw(new AppError(error));
	}

	/*
	*/
	getAPI(url:string) {
		return this.http.get(url, this.createHeaders() )
			.map(response => response.json())
			// .retry(3)
			.catch(this.handleError);
	}

	/*
	*/
	postAPI(options) {
		return this.http.post( options.url, options.body, this.createHeaders() )
		.map(response => response.json())
		// .retry(3)
		.catch(this.handleError);
	}

	/*
	*/
	createHeaders(){
		let headers = new Headers();

		// try to get Auth header and set it
		const authHeader = this.authorizationHeader();

		if(authHeader){
			headers.append('Authorization', authHeader);	
		}

		// add content type header
		headers.append('Content-Type', 'application/json');

		// create header object and return it
		return new RequestOptions({
	        headers: headers
	    });

	}
}
