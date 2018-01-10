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
		let response = localStorage.getItem(`devCenter.${data}`);
		return JSON.parse(response);
	}

	/**
	*/
	removeItem(data) {
		localStorage.removeItem(`devCenter.${data}`);
	}

}
