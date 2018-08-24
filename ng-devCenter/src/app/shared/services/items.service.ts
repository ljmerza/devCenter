import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { NgRedux } from '@angular-redux/store';

import { Actions, RootState } from '@store';
import { DataService } from './data.service';

@Injectable()
export class ItemsService {
	constructor(public dataService:DataService, private store:NgRedux<RootState>) {	}

	setItem(item){
		return this.dataService.post(`${this.dataService.apiUrl}/skipcreds/navbar`, {item});
	}

	processErrorResponse(error):string{
		return this.dataService.processErrorResponse(error);
	}
}
