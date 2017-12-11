import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {

	constructor() { }

	projects = 'project in (AQE, "Auto QM", "Customer DB", "Manager DB", "Taskmaster Dashboard", TeamDB, TQI, "Unified Desktop", UPM, WAM)';
	
	pcr = encodeURIComponent(this.projects + ' AND status != closed AND component in ("PCR - Needed")');

	beta = encodeURIComponent(this.projects + ' AND status != closed AND labels = BETA');

	cr = encodeURIComponent(this.projects + ' AND component in ("PCR - Completed") AND type != "Technical task" AND Status = "code review"');

	qa = encodeURIComponent(this.projects + 'AND status != closed AND status in ("Ready for QA", "IN QA")');

	uctready = encodeURIComponent(this.projects + ' AND status != closed AND issuetype != Epic AND status IN ("Ready for UCT", "IN UCT") AND type != "Technical task" AND type != Sub-task AND assignee != ja2892 AND labels != NewGUI');

	allopen = encodeURIComponent(this.projects+' AND status in ("IN DEVELOPMENT", "IN SPRINT", "Ready for Release", "Code Review", "Ready For QA", "IN QA", "IN UCT", "READY FOR UCT") OR assignee in (wc591w, ep759g)');

	teamdb_ember = encodeURIComponent(' labels = NewGUI');

	apollo = encodeURIComponent('"Epic Link" = Apollo AND Status !=Closed');

	sme = encodeURIComponent('(sprint in (3187, 3183, 3182, 3676, 3185, 3180, 3684, 3186, 3432, 3968) OR assignee in (dh6094, bb486m, cc216t, jc001b, bp215n, tt0163, sm6821, br591w, sr6855, na0952)) AND status != closed');

	fullScrum = encodeURIComponent(this.projects+'AND status != closed');

	scrum = encodeURIComponent('project = BDEUT AND status != closed');

	rocc =  encodeURIComponent('"Epic Link" = ROCC');

	starship = encodeURIComponent('"epic%20link"%3D%20starship');

	pmTickets = encodeURIComponent('resolution = Unresolved AND assignee in (ep759g, wc591w, lk2973)');

	allmy(username){
		return encodeURIComponent(`assignee = ${username} ORDER BY updated DESC`);
	}

	mytickets(username){
		return encodeURIComponent(`assignee = lm240n AND resolution = unresolved ORDER BY due DESC`);
	}

	jiraUrl = 'https://jira.web.att.com:8443';
	crucibleUrl = 'https://icode3.web.att.com';
	codeCloudUrl = 'https://codecloud.web.att.com';

	devUrl = 'http://m5devacoe01.gcsc.att.com';
	betaUrl = 'http://chrapud16b.gcsc.att.com';
	wikiUrl = 'https://wiki.web.att.com';

	msrpLink = 'http://ix.web.att.com:2017';

	chatUrl = 'qto://talk';

	fields = 'attachment,customfield_10109,status,customfield_10212,summary,assignee,components,timetracking,duedate,comment,updated,created,customfield_10102,customfield_10175,customfield_10103,customfield_10602';

	jiraPath = '/secure/Dashboard.jspa';
	cruciblePath = '/cru/browse/CR-UD';
	codeCloudPath = '/projects';
	scrumBoardPath = '/secure/RapidBoard.jspa?rapidView=178&view=planning.nodetail&versions=visible';

	dev_links = [
		{
			link: '/aqe/cgi-bin/index.pl',
			name: 'AQE'
		},
		{
			link: '/teamdb/teams.php?ATTuid=',
			name: 'TeamDB'
		},
		{
			link: '/wam/cgi-bin/wam.pl',
			name: 'WAM'
		},
		{
			link: '/upm/app.php',
			name: 'UPM'
		},
		{
			link: '/Templates/cgi-bin/Template.pl',
			name: 'Template Tool'
		},
		{
			link: '/UD/cgi-bin/worklist.pl',
			name: 'UD'
		},
		{
			link: '/tqi3/cgi-bin/',
			name: 'TQI'
		}

	];

	ember_links = [
		{
			name: 'Asset History',
			link: 'asset/history?asset=TEST&UAT=0&usertimezone=America/New_York&usertimeformat=12HR'
		},
		{
			name: 'Group Ticket',
			link: 'group-lead?lead_ticket=WTXIV000724'
		},
		{
			name: 'WFA Ticket',
			link: 'ticket/ethernet/WTXIV000892'
		},
		{
			name: 'Admin Panel',
			link: 'administration?attuid='
		},
		{
			name: 'BMP Ticket',
			link: 'order/ethernet/BAS539606001'
		},
		{
			name: 'ELD',
			link: 'order/ethernet/BAS539606001'
		},
		{
			name: 'AOTS Advanced Search',
			link: 'ticketing-system/aots/advanced-search'
		}
	];

	order_links = [
		{
			link: 'order/ethernet/GAS544770001',
			name: 'GAS544770001 (EAN)'
		},
		{
			link: 'order/ethernet/OKS433527001',
			name: 'OKS433527001 (Word Doc)'
		},
		{
			link: 'order/ethernet/HOC574865001',
			name: 'HOC574865001 (Juniper)'
		},
		{
			link: 'order/ethernet/BAS539606001',
			name: 'BAS539606001 (Inventory)'
		},
		{
			link: 'order/ethernet/MIS140524001',
			name: 'MIS140524001 (CTH)'
		},
		{
			link: 'order/ethernet/NCC326168001',
			name: 'NCC326168001 (EVC)'
		},
		{
			link: 'order/ethernet/WTS252430001',
			name: 'WTS252430001 (Canopi)'
		},
		{
			link: 'order/ethernet/DLS186977001',
			name: 'DLS186977001 (Force/Edge)'
		},
		{
			link: 'order/ethernet/SWC246312001',
			name: 'SWC246312001 (xlata)'
		},
		{
			link: 'order/ethernet/LBS065263001',
			name: 'LBS065263001 (EvcMultiPointSite)'
		},
		{
			link: 'order/ethernet/ORC338494001',
			name: 'ORC338494001 (timeline)'
		},
		{
			link: 'order/ethernet/SAS118018001',
			name: 'SAS118018001 (OSSCN)'
		},
		{
			link: 'order/ethernet/ARC167777001',
			name: 'ARC167777001'
		},
		{
			link: 'order/ethernet/TNS268897001',
			name: 'TNS268897001'
		},
		{
			link: 'order/ethernet/SLS817036001',
			name: 'SLS817036001'
		},
		{
			link: 'order/ethernet/SWS230192001',
			name: 'SWS230192001'
		},
		{
			link: 'order/ethernet/SFS016277001',
			name: 'SFS016277001'
		},
		{
			link: 'order/ethernet/NOS193664001',
			name: 'NOS193664001'
		}
		,
		{
			link: 'order/ethernet/LBS065460001',
			name: 'LBS065460001'
		}
	];

	teamdb_ember_links = [
		{
			name: 'Teams',
			link: '/teamdb/teams',
		},
		{
			name: 'Edit Team',
			link: '/teamdb/teams/227',
		},
		{
			name: 'Edit Profile',
			link: '/teamdb/users/',
		},
		{
			name: 'Workgroup',
			link: '/teamdb/workgroup',
		}
	];

	prod_links = [
		{
			link: 'http://ud.web.att.com/UD/cgi-bin/worklist.pl',
			name: 'UD'
		},
		{
			link: 'http://aqe.web.att.com/aqe/cgi-bin/index.pl',
			name: 'AQE'
		},
		{
			link: 'http://teamdb.web.att.com/teamdb/teams.php?ATTuid=',
			name: 'TeamDB'
		},
		{
			link: 'http://wam.web.att.com/wam/cgi-bin/wam.pl',
			name: 'WAM'
		},
		{
			link: 'http://gcs-upm.web.att.com/upm2/access.php',
			name: 'UPM'
		},
		{
			link: 'http://gcs-templates.web.att.com/Templates/cgi-bin/Template.pl',
			name: 'Template Tool'
		},
		{
			link: 'http://chrapud09b.gcsc.att.com/tqi3/cgi-bin/',
			name: 'TQI'
		},
		{
			link: 'http://chrapud09b.gcsc.att.com/critdb/alerts.php',
			name: 'Critical Watch'
		}
	];

	beta_links = [
		{
			link: '/aqe/cgi-bin/index.pl',
			name: 'AQE'
		},
		{
			link: '/teamdb/teams.php?ATTuid=',
			name: 'TeamDB'
		},
		{
			link: '/wam/cgi-bin/wam.pl',
			name: 'WAM'
		},
		{
			link: '/upm2/access.php',
			name: 'UPM'
		},
		{
			link: '/Templates/cgi-bin/Template.pl',
			name: 'Template Tool'
		},
		{
			link: '/tqi3/cgi-bin/index.pl',
			name: 'TQI'
		}
	];

	wikiLinks = [
		{	
			name: 'Glossary',
			link: 'http://glossary.web.att.com/'
		},
		{
			name: 'Accelerate',
			link: '/pages/viewpage.action?pageId=480723373',
			wiki: true
		},
		{
			name: 'Biz Ops',
			link: '/display/GCSDevOps/GCS+BizOps',
			wiki: true
		},
		{
			divider: true
		},
		{
			name: 'New Hire',
			link: '/display/GCSDevOps/Complete+New+Hire+Training+Program',
			wiki: true
		},
		{
			name: 'Create SASHA UA Ticket',
			link: '/display/GCSDevOps/HOWTO%3A+Create+a+SASHA+UA+Ticket',
			wiki: true
		},
		{
			name: 'AQE Basics',
			link: '/display/GCSDevOps/AQE%3A+How+to+Work+An+AQE+Search+String+Ticket',
			wiki: true
		},
		{
			name: 'API Defect',
			link: '/pages/viewpage.action?spaceKey=GCSDevOps&title=HOWTO%3A+Report+an+API+Defect',
			wiki: true
		},
		{
			name: 'Team Deployments',
			link: '/display/GCSDevOps/Team+Deployments+Walkthrough',
			wiki: true
		},
		{
			divider: true
		},
		{
			name: 'Ember Links',
			links: [
				{
					name: 'Ember Install',
					link: '/display/GCSDevOps/Ember+Installation+and+Setup',
					wiki: true
				},
				{
					name: 'Ember API',
					link: 'https://emberjs.com/api/ember/2.14/modules/ember'
				},
				{
					name: 'Ember-Data API',
					link: 'https://emberjs.com/api/ember-data/2.14/modules/ember-data'
				},
				{
					name: 'Ember Acceptance Test',
					link: 'https://guides.emberjs.com/v2.14.0/testing/acceptance/'
				},
				{
					name: 'Ember Twiddle',
					link: 'https://ember-twiddle.com'
				}
			]
		},
		{
			name: 'Coding Standards',
			links: [
				{
					name: 'Perl',
					link: '/pages/viewpage.action?pageId=383617008',
					wiki: true
				},
				{
					name: 'JavaScript',
					link: '/display/GCSDevOps/DTI+-+JavaScript+Coding+Standards',
					wiki: true
				},
				{
					name: 'SQL',
					link: '/display/GCSDevOps/DTI+-+SQL+Coding+Standards',
					wiki: true
				}
			]
		},
		{
			name: 'Documentation',
			links: [
				{
					name: 'DataTables',
					link: 'https://datatables.net/reference/api'
				},
				{
					name: 'moment.js',
					link: 'https://momentjs.com/docs/'
				},
				{
					name: 'Lodash',
					link: 'https://lodash.com/docs/4.17.4'
				},
				{
					name: 'Underscore',
					link: 'http://underscorejs.org/'
				},
				{
					name: 'Jira API 7.1.10',
					link: 'https://docs.atlassian.com/jira/REST/7.1.10/'
				},
				{
					name: 'Ember Power Select',
					link: 'http://www.ember-power-select.com/docs/how-to-use-it'
				},
			]
		},
		{
			name: 'Pretty Printers',
			links: [
				{
					name: 'XML',
					link: 'http://xmlprettyprint.com/'
				},
				{
					name: 'JSON',
					link: 'http://jsonprettyprint.com/'
				},
				{
					name: 'HTML/CSS/JS',
					link: 'https://www.10bestdesign.com/dirtymarkup/'
				},
			]
		},
		{
			divider: true
		},
		{
			name: 'Git Repos',
			link: '/display/GCSDevOps/Git+Process+-+DTI',
			wiki: true
		},
		{
			name: 'Test Circuits',
			link: '/display/GCSDevOps/Test+Circuits+for+BMP+and+WFA',
			wiki: true
		},
		{
			name: 'Crucible PCR Process',
			link: '/display/GCSDevOps/Crucible+Code+Reviews',
			wiki: true
		},
		{
			name: 'Jira Workflow',
			link: '/display/GCSDevOps/Developer+Workflow+in+JIRA',
			wiki: true
		},
		{
			divider: true
		},
		{
			name: 'Moose',
			link: 'http://moose.web.att.com/'
		},
		{
			name: 'RPEL',
			link: 'https://repl.it/'
		},
		{
			name: 'Help Desk',
			link: 'http://servicedesk.it.att.com/toolkit/cdt/index.cfm'
		},
		{
			name: 'API Catalog',
			link: 'http://apicatalog.web.att.com/'
		},
		{
			name: 'Regex Explorer',
			link: 'https://regex101.com/'
		},
	];

}