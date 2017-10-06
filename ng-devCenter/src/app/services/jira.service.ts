import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { DataService } from './data.service';

@Injectable()
export class JiraService extends DataService{

	jiraUrl = 'https://jira.web.att.com:8443';
	// apiUrl = this.jiraUrl;
	apiUrl = 'http://127.0.0.1:5858'

	constructor(http: Http) {
		super(http);
	}

	/*
	*/
	getFilter(filterNumber:number) {
		return super.getAPI(`${this.apiUrl}/jira/filter/${filterNumber}`);
	}

	pcrPass(crucible_id, attuid) {
		return super.postAPI({
			url: `${this.apiUrl}/crucible/review/pcr_pass/`,
			body: {
		        crucible_id: crucible_id,
				attuid: attuid
		    }
		})
	}

	pcrComplete(crucible_id, attuid) {
		return super.postAPI({
			url: `${this.apiUrl}/crucible/review/pcr_complete/`,
			body: {
		        crucible_id: crucible_id,
				attuid: attuid
		    }
		})
	}

}
