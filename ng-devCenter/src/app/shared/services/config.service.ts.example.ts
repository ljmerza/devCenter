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