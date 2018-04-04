import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable()
export class ItemsService {

	constructor(public dataService:DataService) {	}

	/**
	 * gets all items from the DB
	 */
	getItems(){
		return this.dataService.get(`${this.dataService.apiUrl}/navbar`);
	}

	/**
	 * sets an item in the DB
	 */
	setItem(item){
		return this.dataService.post(`${this.dataService.apiUrl}/navbar`, {item});
	}

	
	/**
	 *
	 */
	processErrorResponse(error):string{
		return this.dataService.processErrorResponse(error);
	}
}
