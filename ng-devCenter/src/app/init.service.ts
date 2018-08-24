import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { DataService } from './shared/services/data.service';

import { select, NgRedux } from '@angular-redux/store';
import { RootState, Actions } from '@store';

@Injectable()
export class InitService {
	constructor(public dataService:DataService, private store:NgRedux<RootState>) {	}

	getStartupData(){
		let params = new HttpParams();
		params = params.append('isHardRefresh', `true`);
		
		return Promise.all(this.getJql(params), this.getNavItems(params));
	}

	getJql(params){
		return this.dataService.get(`${this.dataService.apiUrl}/skipcreds/jql_links`, {params})
			.toPromise()
            .then((jqls: any) => this.store.dispatch({type: Actions.jqlLinks, payload: jqls.data }))
            .catch(() => Promise.resolve());
	}

	getNavItems(params){
		return this.dataService.get(`${this.dataService.apiUrl}/skipcreds/navbar`, {params})
			.toPromise()
            .then((jqls: any) => this.store.dispatch({type: Actions.navBarItems, payload: jqls.data }))
            .catch(() => Promise.resolve());
	}
}
