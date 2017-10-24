import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/map';

import { AppError } from './../errors/app-error';
import { NotFoundError } from './../errors/not-found-error';

import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class DataService {

	jiraUrl = 'https://jira.web.att.com:8443';
	crucibleUrl = 'https://icode3.web.att.com';
	apiUrl = 'http://localhost:5858/dev_center';

	/*
	*/
	constructor(private http:Http) { }

	authorizationHeader = 'Basic bG0yNDBuOlN0QHJ3YXJz';
	
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
		return this.http.get(url)
			.map(response => response.json())
			.retry(3)
			.catch(this.handleError);
	}


	/*
	*/
	getApiInterval(url:string, intervalSeconds:number) {
		return Observable
			.interval(intervalSeconds*1000)
			.flatMap(() => this.getAPI(url));
	}

	/*
	*/
	postAPI(options) {

		let headers = new Headers();
		headers.append('Authorization', this.authorizationHeader);
		headers.append('Content-Type', 'application/json');

		const requestOptionsObject = new RequestOptions({
	        headers: headers
	    });

		return this.http.post(options.url, options.body, requestOptionsObject)
		.map(response => response.json())
		// .retry(3)
		.catch(this.handleError);
	}
}
