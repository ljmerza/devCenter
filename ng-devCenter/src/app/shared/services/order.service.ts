import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { DataService } from './data.service';

@Injectable()
export class OrderService {

	constructor(private dataService:DataService) { }

	/**
	 *
	 */
	getOrders(){
		let params = new HttpParams();
 		params = params.append('isHardRefresh', `true`);
		return this.dataService.get(`${this.dataService.apiUrl}/api/orders`, {params});
	}

	/**
	 *
	 */
	processErrorResponse(message){
		return this.dataService.processErrorResponse(message);
	}
}