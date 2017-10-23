import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { DataService } from './data.service';

@Injectable()
export class JiraService extends DataService{

	constructor(http: Http) {
		super(http);
	}

	/*
	*/
	getFilterData(jiraListType:string) {
		let filterNumber;

		switch(jiraListType) {
			case 'pcr':
				filterNumber = 11128;
				break;

			case 'beta':
				filterNumber = 11004;
				break;

			case 'cr':
				filterNumber = 11007;
				break;

			case 'qa':
				filterNumber = 11019;
				break;

			case 'uctready':
				filterNumber = 11014;
				break;

			case 'allmy':
				filterNumber = 11418;
				break;

			case 'allopen':
				filterNumber = 12523;
				break;

			default:
				filterNumber = 12513;
				break;
		}

		const fields = 'customfield_10109,status,customfield_10212,summary,assignee,components,aggregatetimeestimate,aggregatetimeoriginalestimate,duedate'

		return super.getAPI(`${this.apiUrl}/jira/filter/${filterNumber}?fields=${fields}`);
	}

	pcrPass(id, attuid) {
		return super.postAPI({
			url: `${this.apiUrl}/crucible/review/pcr_pass/`,
			body: JSON.stringify({
		        crucible_id: id,
				username: attuid
		    })
		})
	}

	pcrComplete(id, attuid) {
		return super.postAPI({
			url: `${this.apiUrl}/crucible/review/pcr_complete/`,
			body: JSON.stringify({
		        key: id,
				username: attuid
		    })
		})
	}

}
