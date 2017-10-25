import { Injectable } from '@angular/core';

@Injectable()
export class UserService {

	username;
	port;
	password;
	emberUrl;
	emberLocal;
	emberPort;

	constructor() { 
		this.username = localStorage.getItem('devCenter.username') || '';
		this.port = localStorage.getItem('devCenter.port') || '';
		this.password = localStorage.getItem('devCenter.password') || '';
		this.emberUrl = localStorage.getItem('devCenter.emberUrl') || '';

		this.setUrls();
	}

	/*
	*/
	setUserData(data:string, value){
		if(value){
			localStorage.setItem(`devCenter.${data}`, value);
			this[data] = value;

			this.setUrls();
		}
	}

	emberBuilds = [
		{'label':'acoe', 'value':'m5devacoe01.gcsc.att.com'},
		{'label':'localhost', 'value':'localhost'}
	];


	setUrls(){
		// set emberUrl based on if localhost or not
		if(this.emberUrl && this.emberUrl.match(/localhost/)){
			this.emberLocal = '#/';
			this.emberPort = '4200';
		} else {
			this.emberLocal = '';
			this.emberPort = this.port;
			console.log(this.emberPort)
		}
	}

	
}
