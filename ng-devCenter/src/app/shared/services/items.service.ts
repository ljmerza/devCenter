import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NgRedux } from '@angular-redux/store';

import { DataService } from './data.service';
import { RootState, Actions } from '@store';

@Injectable()
export class ItemsService {

	constructor(public dataService:DataService, private store:NgRedux<RootState>) {	}

	/**
	 * gets all items from the DB
	 */
	getItems(){
		return this.dataService.get(`${this.dataService.apiUrl}/navbar`);
	}

	/**
	 * gets all JQL links from the DB
	 */
	getJqlLinks(){
		return this.dataService.get(`${this.dataService.apiUrl}/jql_links`);
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
