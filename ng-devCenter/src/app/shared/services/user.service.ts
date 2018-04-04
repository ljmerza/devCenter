import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService } from './config.service';
import { ToastrService } from './toastr.service';
import { DataService } from './data.service';
import { LocalStorageService } from './local-storage.service';


@Injectable()
export class UserService {

	constructor(public dataService:DataService, public config:ConfigService, private ls:LocalStorageService) {	}

	public redirectUrl:string;
	userValues:Array<string> = ['username', 'password', 'port', 'cache', 'emberUrl', 'teamUrl'];

	public emberLocalPort:string = '4200';
	public emberApiPort:string = '3';
	public teamLocalPort:string = '4200';
	public teamApiPort:string = '5';

	emberBuilds:Array<Object> = [
		{'label':'Dev Server', 'value':this.config.devUrl},
		{'label':'Locally', 'value':'http://localhost'}
	];

	public get username():string{
		return this.ls.getItem('username') || '';
	}
	public set username(username){
		this.ls.setItem('username', username);
	}

	public get password():string{
		let password;
		try {
			password = atob(this.ls.getItem('password') || '');
		} catch(err) {
			password = '';
		}
		return password;
	}
	public set password(password){
		// hash password so it's at least not plain text...
		try {
			password = btoa(password);
		} catch(err) {
			password = '';
		}

		this.ls.setItem('password', password);
	}

	public get port():string{
		return this.ls.getItem('port') || '';
	}
	public set port(port){
		this.ls.setItem('port', port);
	}

	public get emberUrl():string{
		return this.ls.getItem('emberUrl') || '';
	}
	public set emberUrl(emberUrl){
		this.ls.setItem('emberUrl', emberUrl);
	}

	public get teamUrl():string{
		return this.ls.getItem('teamUrl') || '';
	}
	public set teamUrl(teamUrl){
		this.ls.setItem('teamUrl', teamUrl);
	}

	public get cache():string{
		return this.ls.getItem('cache') || '';
	}
	public set cache(cache){
		this.ls.setItem('cache', cache);
	}

	public get emberLocal():string{
		if(this.emberUrl && this.emberUrl.match(/local/i)){
			return '#/';
		} else {
			return '';
		}
	}

	public get emberPort():string{
		if(this.emberUrl && this.emberUrl.match(/local/i)){
			return this.emberLocalPort;
		} else {
			return this.port;
		}
	}

	public get teamLocal():string{
		// set teamUrl based on if localhost or not
		if(this.teamUrl && this.teamUrl.match(/local/i)){
			return '#/';
		} else {
			return '#/';
		}
	}
	public get teamPort():string{
		// set teamUrl based on if localhost or not
		if(this.teamUrl && this.teamUrl.match(/local/i)){
			return this.teamLocalPort;
		} else {
			return this.teamApiPort+this.port;
		}
	}

	/*
	*/
	public setUserData(key:string, value): void {

		if(key == 'cache'){
			value = value ? '1' : '';
		}

		this[key] = value;
	}

	/*
	*/
	public resetUserData(): void {
		this.redirectUrl = '';

		this.userValues.forEach(value => {
			this[value] = '';
		});
	}

	/**
	*/
	public needRequiredCredentials():boolean {
		return !(this.username && this.password && this.port && this.emberUrl && this.teamUrl);
	}


	processErrorResponse(error):string{
		return this.dataService.processErrorResponse(error);
	}
}
