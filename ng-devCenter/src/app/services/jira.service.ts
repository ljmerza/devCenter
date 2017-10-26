import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { DataService } from './data.service';
import { UserService } from './user.service';

@Injectable()
export class JiraService extends DataService {
	fields:string = 'customfield_10109,status,customfield_10212,summary,assignee,components,timetracking,duedate'


	/*
	*/
	constructor(http: Http, user:UserService) {
		super(http, user);
	}


	/*
	*/
	getFilterData(jiraListType:string) {
		let filterNumber:string = '';
		let jql:string = '';

		switch(jiraListType) {
			case 'pcr':
				filterNumber = '11128';
				break;

			case 'beta':
				filterNumber = '11004';
				break;

			case 'cr':
				filterNumber = '11007';
				break;

			case 'qa':
				filterNumber = '11019';
				break;

			case 'uctready':
				filterNumber = '11014';
				break;

			case 'allmy':
				filterNumber = '11418';
				break;

			case 'allopen':
				filterNumber = '12523';
				break;

			default:
				jql = `assignee%20%3D%20${this.user.username}%20AND%20resolution%20%3D%20unresolved%20ORDER%20BY%20priority%20DESC%2C%20created%20ASC`;

				break;
		}


		return super.getAPI(`${this.apiUrl}/jira/tickets?jql=${jql}&fields=${this.fields}&filter=${filterNumber}`);
	}

	/*
	*/
	pcrPass(id, attuid) {
		return super.postAPI({
			url: `${this.apiUrl}/crucible/review/pcr_pass`,
			body: JSON.stringify({
		        crucible_id: id,
				username: attuid
		    })
		})
	}

	/*
	*/
	pcrComplete(id, attuid) {
		return super.postAPI({
			url: `${this.apiUrl}/crucible/review/pcr_complete`,
			body: JSON.stringify({
		        key: id,
				username: attuid
		    })
		})
	}

}
