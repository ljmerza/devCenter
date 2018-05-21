import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CrucibleService {

	constructor(private dataService: DataService) { }

	/**
	 * @param {string} crucibleId
	 * @return {Observable<any>} 
	 */
	getComments(crucibleId:string): Observable<any> {
		return this.dataService.get(`${this.dataService.apiUrl}/crucible/comments/${crucibleId}`);
	}

	processErrorResponse(message){
		return this.dataService.processErrorResponse(message);
	}

}
