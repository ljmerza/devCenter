import { Injectable } from '@angular/core';


@Injectable()
export class ConfigService {
	constructor() { }

	jiraUrl = '';
	crucibleUrl = '';
	codeCloudUrl = '';
	devUrl = '';
	betaUrl = '';
	wikiUrl = '';
	msrpLink = '';
	chatUrl = '';
	jiraPath = '';
	cruciblePath = '';
	codeCloudPath = '';
	scrumBoardPath = '';
	myApex = '';

	projectsJql = '';
	
	roccathonTickets = encodeURIComponent('');
	mytickets = encodeURIComponent('');
	project = encodeURIComponent('');

	allProjectNames = [
		// var name to get JQL, name on navbar dropdown, display name on table header 
		{link: 'project', name: 'Project', displayName: 'Project'} 
	];

	teamTicketListNames = [
		{link: 'mytickets', name: 'My Tickets', displayName: 'My Open'}
	];

	otherTicketListNames = [
		{link: 'otherList', name: 'otherList', displayName: 'otherList'}
	];
	
	
	// jira fields to get
	fields = 'attachment,fixVersions,timeoriginalestimate,status,summary,assignee,components,timetracking,duedate,comment,updated,created';

	wikiLinks = [
		{
			name: '',
			links: [
				{	
					name: '',
					link: ''
				},
				{
					name: '',
					link: '',
					wiki: true
				},
				{
					name: '',
					link: '',
					wiki: true
				},
			]
		},
		{
			name: '',
			link: '',
			wiki: true
		},
		{
			divider: true
		},
		{
			name: '',
			links: [
				{
					name: '',
					link: '',
					wiki: true
				},
				{
					name: '',
					link: ''
				},
			]
		},
		{
			divider: true
		},
		{
			name: '',
			link: ''
		},
		{
			name: '',
			link: ''
		}
	];
	
}