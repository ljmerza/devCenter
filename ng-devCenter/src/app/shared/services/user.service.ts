import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { ConfigService } from './config.service';
import { ToastrService } from './toastr.service';
import { DataService } from './data.service';


@Injectable()
export class UserService {
	userValues:Array<string> = ['username', 'password', 'port', 'cache', 'emberUrl', 'teamUrl'];
	public redirectUrl:string;

	public username:string;
	public port:string;
	public password:string;

	public emberUrl:string;
	public emberLocal:string;
	public emberPort:string;
	public emberLocalPort:string = '4200';
	public emberApiPort:string = '3';

	public teamUrl:string;
	public teamLocal:string;
	public teamPort:string;
	public teamLocalPort:string = '4200';
	public teamApiPort:string = '5';

	public cache;

	emberBuilds:Array<Object> = [
		{'label':'Dev Server', 'value':this.config.devUrl},
		{'label':'Locally', 'value':'http://localhost'}
	];

	constructor(public dataService:DataService, public config:ConfigService) {

		this.username = localStorage.getItem('devCenter.username') || '';
		this.port = localStorage.getItem('devCenter.port') || '';

		// try to decode password if not okay then set to empty
		try {
			this.password = atob(localStorage.getItem('devCenter.password') || '');
		} catch(err) {
			this.password = '';
		}

		this.emberUrl = localStorage.getItem('devCenter.emberUrl') || '';
		this.teamUrl = localStorage.getItem('devCenter.teamUrl') || '';
		this.cache = localStorage.getItem('devCenter.cache') || '';
		this.setUrls();
	}

	/*
	*/
	public setUserData(data:string, value): void {

		// if cache then true is 1 else false is empty string
		if(data == 'cache'){
			value = value ? '1' : '';
		}

		// save value
		this[data] = value;

		// hash password so it's at least not plain text...
		if(data === 'password'){
			value = btoa(value);
		}
		localStorage.setItem(`devCenter.${data}`, value);

		this.setUrls();
	}

	/*
	*/
	public resetUserData(): void {
		this.redirectUrl = '';

		this.userValues.forEach(value => {
			localStorage.removeItem(`devCenter.${value}`);
			this[value] = null;
		});
	}

	/*
	*/
	private setUrls(): void {
		// set emberUrl based on if localhost or not
		if(this.emberUrl && this.emberUrl.match(/local/i)){
			this.emberLocal = '#/';
			this.emberPort = this.emberLocalPort;
		} else {
			this.emberLocal = '';
			this.emberPort = this.port;
		}

		// set teamUrl based on if localhost or not
		if(this.teamUrl && this.teamUrl.match(/local/i)){
			this.teamLocal = '#/';
			this.teamPort = this.teamLocalPort;
		} else {
			this.teamLocal = '#/';
			this.teamPort = this.teamApiPort+this.port;
		}

	}

	/**
	*/
	public needRequiredCredentials() {
		return !(this.username && this.password && this.port && this.emberUrl && this.teamUrl);
	}

	getNavbarItems(){
		return this.dataService.get(`${this.dataService.apiUrl}/navbar`)
		.catch( error => this.dataService.processErrorResponse(error) );
	}
}
