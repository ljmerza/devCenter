import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

	constructor() { }

	/**
	*/
	setItem(data, value) {
		const jsonValue = JSON.stringify(value);
		localStorage.setItem(`devCenter.${data}`, jsonValue);
	}

	/**
	*/
	getItem(data) {
		let value = localStorage.getItem(`devCenter.${data}`) || '';

		try {
			if(data === 'password'){
				value = atob(value);
			}
			return JSON.parse(value);
		} catch(e){
			return value || '';
		}
	}

	/**
	*/
	removeItem(data) {
		localStorage.removeItem(`devCenter.${data}`);
	}

}
