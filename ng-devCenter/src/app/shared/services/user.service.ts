import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { DataService } from './data.service';
import { LocalStorageService } from './local-storage.service';


@Injectable()
export class UserService {

	constructor(public dataService:DataService, public config:ConfigService, private ls:LocalStorageService) {
		this.devServers = config.devServers;
	}

	public redirectUrl:string;
	userValues:Array<string> = ['username', 'password', 'port', 'cache', 'emberUrl', 'teamUrl', 'devServer'];

	public emberLocalPort:string = '4200';
	public emberApiPort:string = '3';
	public teamLocalPort:string = '4200';
	public teamApiPort:string = '5';

	emberBuilds:Array<Object> = [
		{ 'label':'Development Server', 'value': 'devServer' },
		{ 'label':'Local Server', 'value':'localServer' }
	];

	devServers: Array<Object>;
	breakVersionValue = '10.0.0';

	public get breakVersion(): string {
		return this.ls.getItem(this.breakVersionValue) || '';
	}
	public set breakVersion(breakVersion) {
		this.ls.setItem(this.breakVersionValue, breakVersion);
	}

	public get username():string{
		return this.ls.getItem('username') || '';
	}
	public set username(username){
		this.ls.setItem('username', username);
	}

	public get password():string {
		return this.ls.getItem('password') || '';
	}
	public set password(password){
		this.ls.setItem('password', password);
	}
	public encryptPassword(password){
		return this.dataService.post(`${this.dataService.apiUrl}/skipcreds/encrypt`, {password});
	}

	public get port():string{
		return this.ls.getItem('port') || '';
	}
	public set port(port){
		this.ls.setItem('port', port);
	}

	public get emberUrlBase():string{
		return this.emberUrl === 'localServer' ? 'http://localhost' : this.devServerUrl;
	}
	public get emberUrl():string{
		return this.ls.getItem('emberUrl') || '';
	}
	public set emberUrl(emberUrl){
		this.ls.setItem('emberUrl', emberUrl);
	}

	public get teamUrlBase():string{
		return this.teamUrl === 'localServer' ? 'http://localhost' : this.devServerUrl;
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

	public get devServer(): string {
		return this.ls.getItem('devServer') || '';
	}

	public get devServerUrl(): string {
		const devServer = this.ls.getItem('devServer') || '';
		return `http://${devServer}.${this.config.rootDomain}`;
	}

	public set devServer(devServer) {
		this.ls.setItem('devServer', devServer);
	}

	/**
	 * 
	 */
	public get emberLocal():string{
		if(this.emberUrl && this.emberUrl.match(/local/i)){
			return '#/';
		} else {
			return '';
		}
	}

	/**
	 * 
	 */
	public get emberPort():string{
		if(this.emberUrl && this.emberUrl.match(/local/i)){
			return this.emberLocalPort;
		} else {
			return this.port;
		}
	}

	/**
	 * 
	 */
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

	/**
	 * 
	 * @param key 
	 * @param value 
	 */
	public setUserData(key:string, value): void {
		if(key == 'cache'){
			value = value ? '1' : '';
		}

		this[key] = value;
	}

	/**
	 * 
	 */
	public resetUserData(): void {
		this.redirectUrl = '';

		this.userValues.forEach(value => {
			this[value] = '';
		});
	}

	/**
	 * 
	 */
	public needRequiredCredentials():boolean {

		// if introducing a break version reset user data to 
		// force all users to log back in
		if (!this.breakVersion){
			this.breakVersion = '1';
			this.resetUserData();
		}

		return !(this.username && this.password && this.port && this.emberUrl && this.teamUrl && this.devServer);
	}

	/**
	 * 
	 */
	processErrorResponse(error):string{
		return this.dataService.processErrorResponse(error);
	}
}
