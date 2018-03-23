import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

	constructor() { }

	/**
	*/
	setItem(key, value) {
		try {
			value = JSON.stringify(value)
		} catch(e){
			value = '';
		}
		localStorage.setItem(`devCenter.${key}`, value);
	}

	/**
	*/
	getItem(key) {
		let value = localStorage.getItem(`devCenter.${key}`) || '';
		try {
			return JSON.parse(value);
		} catch(e){
			return value || '';
		}
	}

	/**
	*/
	removeItem(key) {
		localStorage.removeItem(`devCenter.${key}`);
	}

}
