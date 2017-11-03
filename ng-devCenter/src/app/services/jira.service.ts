import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { DataService } from './data.service';
import { UserService } from './user.service';

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
				jql = 'project+in+(AQE,+%22Taskmaster+Dashboard%22,+TeamDB,+TQI,+%22Unified+Desktop%22,+UPM,+WAM,+SASHA)+AND+status+!%3D+closed+AND+component+in+(%22PCR+-+Needed%22)'
				this.title = 'Peer Code Review';
				break;

			case 'beta':
				jql='project+in+(AQE,+%22Taskmaster+Dashboard%22,+TeamDB,+TQI,+%22Unified+Desktop%22,+UPM,+WAM)+AND+status+!%3D+closed+AND+labels+%3D+BETA'
				this.title = 'Beta';
				break;

			case 'cr':
				jql ='project+in+(AQE,+%22Taskmaster+Dashboard%22,+TeamDB,+TQI,+%22Unified+Desktop%22,+UPM,+WAM)+AND+component+in+(%22PCR+-+Completed%22)+AND+type+!%3D+%22Technical+task%22+AND+Status+%3D+%22code+review%22'
				this.title = 'Code Review';
				break;

			case 'qa':
				jql ='project+in+(AQE,+%22Taskmaster+Dashboard%22,+TeamDB,+TQI,+%22Unified+Desktop%22,+UPM,+WAM)+AND+status+!%3D+closed+AND+status+in+(%22Ready+for+QA%22,+%22IN+QA%22)'
				break;

			case 'uctready':
				jql = 'project+in+(AQE,+%22Customer+DB%22,+%22Desktop+Integration%22,+%22Taskmaster+Dashboard%22,+TeamDB,+TQI,+UPM,+%22Unified+Desktop%22,+WAM)+AND+status+!%3D+closed+AND+issuetype+!%3D+Epic+AND+status+%3D+%22Ready+for+UCT%22+AND+type+!%3D+%22Technical+task%22+AND+type+!%3D+Sub-task+AND+assignee+!%3D+ja2892'
				this.title = 'UCT Ready';
				break;

			case 'allmy':
				jql =`assignee%20%3D%20${this.user.username}%20ORDER%20BY%20updated%20DESC`
				filterNumber = '11418';
				this.title = 'All My';
				break;

			case 'allopen':
				jql='project%20in%20(AQE%2C%20"Auto%20QM"%2C%20"Customer%20DB"%2C%20"Manager%20DB"%2C%20"Taskmaster%20Dashboard"%2C%20TeamDB%2C%20TQI%2C%20"Unified%20Desktop"%2C%20UPM%2C%20WAM)%20AND%20status%20in%20("IN%20DEVELOPMENT"%2C%20"IN%20SPRINT"%2C%20"Ready%20for%20Release"%2C%20"Code%20Review"%2C%20"Ready%20For%20QA"%2C%20"IN%20QA"%2C%20"READY%20FOR%20UCT")%20OR%20assignee%20in%20(wc591w%2C%20ep759g)%20ORDER%20BY%20due%20DESC'
				this.title = 'All Open';
				break;

			case 'teamdb_ember':
				jql='labels%3DNewGUI'
				this.title = 'TeamDB Ember';
				break;

			case 'apollo':
				jql='"Epic%20Link"%20%3D%20Apollo%20and%20status%20!%3D%20closed'
				this.title = 'Apollo';
				break;

			case 'sme':
				jql='sprint%20in%20(3187%2C%203183%2C%203182%2C%203676%2C%203185%2C%203180%2C%203684%2C%203186%2C%203432)%20AND%20status%20!%3D%20closed'
				this.title = 'SME';
				break;

			case 'scrum':
				jql='project%20in%20(AQE%2C%20"Desktop%20Integration"%2C%20TeamDB%2C%20TQI%2C%20"Unified%20Desktop"%2C%20UPM%2C%20WAM)%20AND%20status%20!%3D%20closed'
				this.title = 'Scrum Board';
				break;

			default:
				this.title = 'My Open';
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

	/*
	*/
	searchTicket(msrp:string){
		return super.getAPI(`${this.apiUrl}/jira/getkey/${msrp}`)
	}

}
