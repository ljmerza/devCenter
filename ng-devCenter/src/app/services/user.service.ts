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

	emberBuilds:Array<Object> = [
		{'label':'acoe', 'value':this.config.devUrl},
		{'label':'localhost', 'value':'http://localhost'}
	];

	constructor(public config:ConfigService) { 
		this.username = localStorage.getItem('devCenter.username') || '';
		this.port = localStorage.getItem('devCenter.port') || '';
		this.password = localStorage.getItem('devCenter.password') || '';
		this.emberUrl = localStorage.getItem('devCenter.emberUrl') || '';

		this.setUrls();
	}

	/*
	*/
	public setUserData(data:string, value): void {
		if(value){
			localStorage.setItem(`devCenter.${data}`, value);
			this[data] = value;
			this.setUrls();
		}
	}

	/*
	*/
	public resetUserData(): void {
		localStorage.removeItem(`devCenter.emberUrl`);
		localStorage.removeItem(`devCenter.password`);
		localStorage.removeItem(`devCenter.port`);
		localStorage.removeItem(`devCenter.username`);
	}

	/*
	*/
	private setUrls(): void {
		// set emberUrl based on if localhost or not
		if(this.emberUrl && this.emberUrl.match(/localhost/)){
			this.emberLocal = '#/';
			this.emberPort = '4200';
		} else {
			this.emberLocal = '';
			this.emberPort = this.port;
		}
	}

	public requireCredentials() {
		return !(this.username && this.password && this.port && this.emberUrl);
	}
}
