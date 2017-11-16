import { Injectable } from '@angular/core';
import config from './config';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class UserService {

	username;
	port;
	password;
	emberUrl;
	emberLocal;
	emberPort;

	emberBuilds = [
		{'label':'acoe', 'value':config.devUrl},
		{'label':'localhost', 'value':'localhost'}
	];

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

	/*
	*/
	resetUserData(){
		localStorage.removeItem(`devCenter.emberUrl`);
		localStorage.removeItem(`devCenter.password`);
		localStorage.removeItem(`devCenter.port`);
		localStorage.removeItem(`devCenter.username`);
	}

	/*
	*/
	setUrls(){
		// set emberUrl based on if localhost or not
		if(this.emberUrl && this.emberUrl.match(/localhost/)){
			this.emberLocal = '#/';
			this.emberPort = '4200';
		} else {
			this.emberLocal = '';
			this.emberPort = this.port;
		}
	}

	/*
	*/
	private notifyTickets = new Subject<any>()
	notifyTickets$ = this.notifyTickets.asObservable()
	public notifyTicketComponent() {
		this.notifyTickets.next()
	}
}
