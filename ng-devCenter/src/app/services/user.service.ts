import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ConfigService } from './config.service';

@Injectable()
export class UserService {

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

	public userData;
	public userPicture;
	public cache;

	emberBuilds:Array<Object> = [
		{'label':'Dev Server', 'value':this.config.devUrl},
		{'label':'Locally', 'value':'http://localhost'}
	];

	constructor(public config:ConfigService) { 
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

		if(data === 'password'){
			value = btoa(value);
		}

		localStorage.setItem(`devCenter.${data}`, value);
		this[data] = value;
		this.setUrls();
	}

	/*
	*/
	public resetUserData(): void {
		localStorage.removeItem(`devCenter.emberUrl`);
		localStorage.removeItem(`devCenter.teamUrl`);
		localStorage.removeItem(`devCenter.password`);
		localStorage.removeItem(`devCenter.port`);
		localStorage.removeItem(`devCenter.username`);
		localStorage.removeItem(`devCenter.cache`);
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
			this.teamLocal = '';
			this.teamPort = this.teamApiPort+this.port;
		}

	}

	public requireCredentials() {
		return !(this.username && this.password && this.port && this.emberUrl && this.teamUrl);
	}
}
