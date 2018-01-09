import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

	constructor() { }

	/*
	*/
	setItem(data, value) {
		localStorage.setItem(`devCenter.${data}`, value);
	}

	/*
	*/
	getItem(data) {
		return localStorage.getItem(`devCenter.${data}`);
	}

	/*
	*/
	removeItem(data) {
		localStorage.removeItem(`devCenter.${data}`);
	}

}
