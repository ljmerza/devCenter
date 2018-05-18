import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ChatService {

	constructor(private dataService:DataService) {}
	
	/**
	 * sends custom ping to a chatroom or user
	 * @param {Object} postData
	 * @return {Observable} 
	 */
	sendPing(postData:any): Observable<any> {
		return this.dataService.post(`${this.dataService.apiUrl}/chat/custom_ping`, postData);
	}
}
