import { Injectable } from '@angular/core';

@Injectable()
export class UserService {

	username;
	port;
	password;
	emberUrl;

	constructor() { 
		this.username = localStorage.getItem('devCenter.username') || '';
		this.port = localStorage.getItem('devCenter.port') || '';
		this.password = localStorage.getItem('devCenter.password') || '';
		this.emberUrl = localStorage.getItem('devCenter.emberUrl') || '';
	}

	/*
	*/
	setUserData(data:string, value){
		if(value){
			localStorage.setItem(`devCenter.${data}`, value);
			this[data] = value;
		}
	}

	emberBuilds = [
		{'label':'acoe', 'value':'m5devacoe01.gcsc.att.com'},
		{'label':'localhost', 'value':'localhost'}
	];

	
}
