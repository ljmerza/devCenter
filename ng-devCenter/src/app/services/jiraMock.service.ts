import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { DataService } from './data.service';
import { UserService } from './user.service';

@Injectable()
export class JiraService extends DataService {
	fields:string = 'customfield_10109,status,customfield_10212,summary,assignee,components,timetracking,duedate'
	title:string = '';

	/*
	*/
	constructor(public http: Http, public user:UserService) {
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
				this.title = 'Peer Code Review';
				break;

			case 'beta':
				filterNumber = '11004';
				this.title = 'Beta';
				break;

			case 'cr':
				filterNumber = '11007';
				this.title = 'Code Review';
				break;

			case 'qa':
				filterNumber = '11019';
				this.title = 'QA';
				break;

			case 'uctready':
				filterNumber = '11014';
				this.title = 'UCT Ready';
				break;

			case 'allmy':
				filterNumber = '11418';
				this.title = 'All My';
				break;

			case 'allopen':
				filterNumber = '12523';
				this.title = 'All Open';
				break;

			default:
				this.title = 'My Open';
				jql = `assignee%20%3D%20${this.user.username}%20AND%20resolution%20%3D%20unresolved%20ORDER%20BY%20priority%20DESC%2C%20created%20ASC`;
				break;
		}


		return Observable.create({
			data: [
				{
					key: 'test',
					summary: 'summary',
					status: 'status',
					component: 'comp',
					crucible_id: 'cru',
					username: 'user1',
					dates: {
						started: 12345,
						duedate: 123456,
						estimate: 1234567,
						logged: 123456
					}

				},
				{
					key: 'test2',
					summary: 'summary',
					status: 'status',
					component: 'comp',
					crucible_id: 'cru',
					username: 'user2',
					dates: {
						started: 12345,
						duedate: 123456,
						estimate: 1234567,
						logged: 123456
					}

				},
				{
					key: 'test3',
					summary: 'summary',
					status: 'status',
					component: 'comp',
					crucible_id: 'cru',
					username: 'user1',
					dates: {
						started: 12345,
						duedate: 123456,
						estimate: 1234567,
						logged: 123456
					}

				}
			]
		})
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

	/*
	*/
	searchTicket(msrp:string){
		return super.getAPI(`${this.apiUrl}/jira/get_key/${msrp}`)
	}

}
