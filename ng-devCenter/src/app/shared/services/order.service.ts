import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataService } from './data.service';

@Injectable()
export class OrderService {
	public ordersCache;

	constructor(private dataService:DataService) { }

	/**
	 * get orders. if not a hard refresh and we have a cache then just return that.
	 */
	getOrders(hardRefresh): Observable<any>{
		if(this.ordersCache && !hardRefresh) return Observable.of(this.ordersCache);

		// dont save this in local storage - too big
		let params = new HttpParams();
 		params = params.append('isHardRefresh', `true`);
		return this.dataService.get(`${this.dataService.apiUrl}/skipcreds/json_api/orders`, {params});
	}

	/**
	 *
	 */
	processErrorResponse(message){
		return this.dataService.processErrorResponse(message);
	}
}