import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { UserService } from './user.service';
import { LocalStorageService } from './local-storage.service';

import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/map';

import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class APIService {

	constructor(public http:HttpClient, public user:UserService) { }

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
	public putAPI(args): Observable<any> {
		return this.http.put(args.url, args.body, { headers: this.createHeaders() })
	}

	/*
	*/
	public deleteAPI(args): Observable<any> {
		return this.http.delete(args.url, { headers: this.createHeaders() })
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
}
