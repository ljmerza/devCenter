import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable()
export class OrderService {

	constructor(private dataService:DataService) { }
	/**
	 *
	 */
	getOrders(){
		return this.dataService.get('');
	}

	/**
	 *
	 */
	processErrorResponse(message){
		return this.dataService.processErrorResponse(message);
	}

}
