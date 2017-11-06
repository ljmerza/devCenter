import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { DataService } from './data.service';
import { UserService } from './user.service';

import config from './config';

@Injectable()
export class JiraService extends DataService {
	fields:string = 'customfield_10109,status,customfield_10212,summary,assignee,components,timetracking,duedate,comment'
	title:string = '';

	/*
	*/
	constructor(public http: Http, public user:UserService, public sanitizer: DomSanitizer) {
		super(http, user, sanitizer);
	}


	/*
	*/
	getFilterData(jiraListType:string) {
		let filterNumber:string = '';
		let jql:string = '';

		switch(jiraListType) {
			case 'pcr':
				jql = config.pcr;
				this.title = 'Peer Code Review';
				break;

			case 'beta':
				jql=config.beta;
				this.title = 'Beta';
				break;

			case 'cr':
				jql=config.cr;
				this.title = 'Code Review';
				break;

			case 'qa':
				jql=config.qa;
				this.title = 'QA';
				break;

			case 'uctready':
				jql=config.uctready;
				this.title = 'UCT Ready';
				break;

			case 'allmy':
				jql = config.allmy(this.user.username);
				filterNumber = '11418';
				this.title = 'All My';
				break;

			case 'allopen':
				jql=config.allopen;
				this.title = 'All Open';
				break;

			case 'teamdb_ember':
				jql=config.teamdb_ember;
				this.title = 'TeamDB Ember';
				break;

			case 'apollo':
				jql=config.apollo;
				this.title = 'Apollo';
				break;

			case 'sme':
				jql=config.sme;
				this.title = 'SME';
				break;

			case 'scrum':
				jql=config.scrum;
				this.title = 'Scrum Board';
				break;

			default:
				jql = config.mytickets(this.user.username);
				this.title = 'My Open';
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

	/*
	*/
	searchTicket(msrp:string){
		return super.getAPI(`${this.apiUrl}/jira/getkey/${msrp}`)
	}

}
