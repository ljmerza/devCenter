import { Injectable } from '@angular/core';


@Injectable()
export class ConfigService {
	constructor() { }
	
	username = localStorage.getItem('devCenter.username') || '';

	jiraUrl = 'http://jira.web.att.com';
	crucibleUrl = 'https://icode3.web.att.com';
	codeCloudUrl = 'https://codecloud.web.att.com';
	devUrl = 'http://m5devacoe01.gcsc.att.com';
	betaUrl = 'http://chrapud16b.gcsc.att.com';
	wikiUrl = 'https://wiki.web.att.com';
	msrpLink = 'http://ix.web.att.com:2017';
	chatUrl = 'qto://talk';
	jiraPath = '/secure/Dashboard.jspa';
	cruciblePath = '/cru/browse/CR-UD';
	codeCloudPath = '/projects';
	scrumBoardPath = '/secure/RapidBoard.jspa?rapidView=178&view=planning.nodetail&versions=visible';
	myApex = 'https://myapex.apexsystemsinc.com/psp/MYAPEX/';

	projectsJql = 'project in (AQE, "Auto QM", "Customer DB", "Manager DB", "Taskmaster Dashboard", TeamDB, TQI, "Unified Desktop", UPM, WAM)';
	
	pcr = encodeURIComponent(this.projectsJql + ' AND status != closed AND component in ("PCR - Needed")');
	beta = encodeURIComponent(this.projectsJql + ' AND status != closed AND labels = BETA');
	cr = encodeURIComponent(this.projectsJql + ' AND component in ("PCR - Completed") AND type != "Technical task" AND Status = "code review"');
	qa = encodeURIComponent(this.projectsJql + 'AND status in ("Ready for QA", "IN QA")');

	uctready = encodeURIComponent(this.projectsJql + ' AND issuetype != Epic AND status IN ("Ready for UCT", "IN UCT") AND type != "Technical task" AND type != Sub-task AND assignee != ja2892');
	
	uctreadyNoRoccApollo = encodeURIComponent(this.projectsJql + ' AND issuetype != Epic AND status IN ("Ready for UCT", "IN UCT") AND type != "Technical task" AND type != Sub-task AND assignee != ja2892 AND "Epic Link" not in (apollo, ROCC)');
	
	allopen = encodeURIComponent(this.projectsJql+' AND status in ("ON HOLD", "IN DEVELOPMENT", "IN SPRINT", "Ready for Release", "Code Review", "Ready For QA", "IN QA", "IN UCT", "READY FOR UCT") OR assignee in (wc591w)');

	sme = encodeURIComponent('(sprint in (3187, 3183, 3182, 3676, 3185, 3180, 3684, 3186, 3432, 3968) OR assignee in (dh6094, bb486m, cc216t, jc001b, bp215n, tt0163, sm6821, br591w, sr6855, na0952)) AND status != closed');
	fullScrum = encodeURIComponent(this.projectsJql+'AND status != closed');
	scrum = encodeURIComponent('project = BDEUT AND status != closed');
	teamdb_ember = encodeURIComponent(' labels = NewGUI');

	// projects
	apollo = encodeURIComponent('"Epic Link" = Apollo AND Status !=Closed');
	rocc =  encodeURIComponent('"Epic Link" = ROCC');
	starship = encodeURIComponent('"epic%20link"%3D%20starship');
	rds = encodeURIComponent('text ~ "RDS"');
	roccathonTickets = encodeURIComponent(`"Epic Link" ='ROCC-A-THON Program'`);
	orchestration = encodeURIComponent(`project in ("GCS BizOps - Orchestration") AND status != closed`);
	innovation = encodeURIComponent(`labels = "InnovationExpress(IX)"`);
	sable = encodeURIComponent(`project = "SABLE" and status != closed`);
	cartProject = encodeURIComponent(`project in  = "InnovationExpress(IX)"`);
	apiTeamAccelerate = encodeURIComponent(`project in ("API Team") and status != closed and "Epic Link" in (GCSAPI-380, GCSAPI-896)`);

	allProjectNames = [
		{link: 'teamdb_ember', name: 'TeamDB Ember', displayName: 'TeamDB Ember'},
		{link: 'rocc', name: 'ROCC Automation', displayName: 'ROCC Automation'},
		{link: 'roccathon', name: 'ROCC-A-THON', displayName: 'Roccathon'},
		{link: 'apollo', name: 'Apollo', displayName: 'Apollo'},
		{link: 'starship', name: 'Starship', displayName: 'Starship'},
		{link: 'rds', name: 'RDS', displayName: 'RDS'},
		{link: 'orchestration', name: 'Orchestration', displayName: 'Orchestration'},
		{link: 'innovation', name: 'Innovation Express', displayName: 'Innovation Express'},
		{link: 'sable', name: 'SABLE', displayName: 'SABLE'},
		{link: 'cart', name: 'CART', displayName: 'CART'},
		{link: 'apiud', name: 'API UD', displayName: 'API Team Accelerate'},
	];

	teamTicketListNames = [
		{link: 'mytickets', name: 'My Tickets', displayName: 'My Open'},
		{link: 'pcr', name: 'PCR Needed', displayName: 'Peer Code Review'},
		{link: 'qa', name: 'QA Needed', displayName: 'QA'},
		{link: 'uctready', name: 'UCT Ready', displayName: 'UCT Ready'},
		{link: 'uctreadyNoRoccApollo', name: 'UCT Ready (Short)', displayName: 'UCT Ready (No ROCC/Apollo)'},
		{link: 'cr', name: 'CR Needed', displayName: 'Code Review'},
		{divider: true, link: '', name: '', displayName: ''},
		{link: 'allopen', name: 'All Open Tickets', displayName: 'All Open'},
		{link: 'allmy', name: 'All My Tickets', displayName: 'All My'},
		{link: 'beta', name: 'Beta Tickets', displayName: 'Beta'},
		{divider: true, link: '', name: '', displayName: ''}
	];

	otherTicketListNames = [
		{link: 'sme', name: 'SME', displayName: 'SME'},
		{link: 'pm', name: 'PM', displayName: 'PM'},
		{link: 'scrum', name: 'Scrum Board', displayName: 'Scrum Board'},
		{link: 'fullscrum', name: 'Full Scrum Board', displayName: 'Full Scrum Board'}
	];
	
	pmTickets = encodeURIComponent('resolution = Unresolved AND assignee in ( wc591w, lk2973)');
	allmy = encodeURIComponent(`assignee = ${this.username} ORDER BY updated DESC`);
	mytickets = encodeURIComponent(`assignee = ${this.username} AND resolution = unresolved ORDER BY due DESC`);

	fields = 'attachment,fixVersions,timeoriginalestimate,customfield_10109,status,customfield_10212,summary,assignee,components,timetracking,duedate,comment,updated,created,customfield_10102,customfield_10175,customfield_10103,customfield_10602';


	dev_links = [
		{
			link: '/aqe/cgi-bin/index.pl',
			name: 'AQE'
		},
		{
			link: `/teamdb/teams.php?ATTuid=${this.username}`,
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
			name: 'Asset Inventory',
			link: 'asset/inventory?asset=TEST&UAT=0&usertimezone=America/New_York&usertimeformat=12HR'
		},
		{
			name: 'Admin Panel',
			link: `administration?attuid=${this.username}&cache=`
		},
		{
			name: 'BMP Ticket',
			link: `order/bmp/7O2402151?cache=`
		},
		{
			name: 'ELD',
			link: `order/eld/BAS539606001?cache=`
		},
		{
			name: 'AOTS Advanced Search',
			link: `ticketing-system/aots/advanced-search?cache=`
		},
		{
			name: 'Worklist',
			link: `worklist?cache=`
		},
		{
			name: 'Backup Restore',
			link: `task/backup-restore/123?cache=`
		}
		,
		{
			name: 'Backup Request',
			link: `task/backup-request/123?cache=`
		},
		{
			name: 'Backup Validation',
			link: `task/backup-validation/123?cache=`
		},
		{
			name: 'RDS',
			link: `order/rds/11301788850496TE?cache=`
		},
		{
			name: 'ASE DB',
			link: `order/asedb/11301788850496TE?cache=`
		},
		{
			name: 'Ticket Logs',
			link: `logs/7O2402151?cache=`
		},
		{
			name: 'Client-Request',
			link: `order/client-request/7O2402151?cache=`
		},
		{
			name: 'ROME',
			link: `development/components/rome?cache= `
		},
		{
			name: 'RDS-Data',
			link: `development/rds-data?cache=`
		},
		{
			name: 'Splash-Images',
			link: `splash-images/edit/1?cache=`
		},
	];

	wfaLinks = [
		{
			name: 'Group Ticket',
			link: `group-lead?lead_ticket=WTXIV000724?cache=`
		},
		{
			name: 'WFA Ticket',
			link: `ticket/ethernet/WTXIV000892?cache=`
		},
		{
			name: 'Referrals',
			link: `ticket/ethernet/WILTP177929?cache=`
		}
	];

	orderLinks = [
		{
			link: `order/ethernet/GAS544770001?cache=`,
			name: 'GAS544770001 (EAN)'
		},
		{
			link: `order/ethernet/OKS433527001?cache=`,
			name: 'OKS433527001 (Word Doc)'
		},
		{
			link: `order/ethernet/HOC574865001?cache=`,
			name: 'HOC574865001 (Juniper)'
		},
		{
			link: `order/ethernet/BAS539606001?cache=`,
			name: 'BAS539606001 (Inventory)'
		},
		{
			link: `order/ethernet/MIS140524001?cache=`,
			name: 'MIS140524001 (CTH)'
		},
		{
			link: `order/ethernet/NCC326168001?cache=`,
			name: 'NCC326168001 (EVC)'
		},
		{
			link: `order/ethernet/WTS252430001?cache=`,
			name: 'WTS252430001 (Canopi)'
		},
		{
			link: `order/ethernet/DLS186977001?cache=`,
			name: 'DLS186977001 (Force/Edge)'
		},
		{
			link: `order/ethernet/SWC246312001?cache=`,
			name: 'SWC246312001 (xlata)'
		},
		{
			link: `order/ethernet/LBS065263001?cache=`,
			name: 'LBS065263001 (EvcMultiPointSite)'
		},
		{
			link: `order/ethernet/WTS252804001?cache=`,
			name: 'WTS252804001 (multi-evc)'
		},
		{
			link: `order/ethernet/ORC338494001?cache=`,
			name: 'ORC338494001 (timeline)'
		},
		{
			link: `order/ethernet/SAS118018001?cache=`,
			name: 'SAS118018001 (OSSCN)'
		},
		{
			link: `order/ethernet/ARC167777001?cache=`,
			name: 'ARC167777001 (EXACT)'
		},
		{
			link: `order/ethernet/LAS899407001?cache=`,
			name: 'LAS899407001 (RDS Tracking ID)'
		},
		{
			link: `order/ethernet/KYS015215001?cache=`,
			name: 'KYS015215001 (ASEdb)'
		},
		
	];

	otherOrders = [
		{
			link: `order/ethernet/SLS817036001?cache=`,
			name: 'SLS817036001'
		},
		{
			link: `order/ethernet/SWS230192001?cache=`,
			name: 'SWS230192001'
		},
		{
			link: `order/ethernet/SFS016277001?cache=`,
			name: 'SFS016277001'
		},
		{
			link: `order/ethernet/NOS193664001?cache=`,
			name: 'NOS193664001'
		},
		{
			link: `order/ethernet/LBS065460001?cache=`,
			name: 'LBS065460001'
		},
		{
			link: `order/ethernet/TNS268897001?cache=`,
			name: 'TNS268897001'
		},
	];

	teamdb_ember_links = [
		{
			name: 'Teams',
			link: `/teamdb/teams?cache=`,
		},
		{
			name: 'Edit Team',
			link: `/teamd/teams/227?cache=`,
		},
		{
			name: 'Edit Profile',
			link: `/teamdb/users/?cache=`,
		},
		{
			name: 'Workgroup',
			link: `/teamdb/workgroup?cache=`,
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
			link: `http://teamdb.web.att.com/teamdb/teams.php?ATTuid=${this.username}`,
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
		},
		{
			link: 'http://chrapud22.gcsc.att.com:4040/order/gps/cr/149686',
			name: 'UD_api'
		},
		{
			link: 'http://ud-beta.web.att.com/UD-ember/#/ticket/ethernet/WILOJ017967',
			name: 'UD ember'
		}
	];

	wikiLinks = [
		{
			name: 'AT&T Wiki',
			links: [
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
			]
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
					name: 'Component Lifecycle',
					link: 'https://guides.emberjs.com/v2.5.0/components/the-component-lifecycle/'
				},
				{
					name: 'Ember Acceptance Test',
					link: 'https://guides.emberjs.com/v2.14.0/testing/acceptance/'
				},
				{
					name: 'Ember Twiddle',
					link: 'https://ember-twiddle.com'
				},
				{
					name: 'Ember Power Select',
					link: 'http://www.ember-power-select.com/docs/how-to-use-it'
				},
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
					link: 'https://docs.atlassian.com/software/jira/docs/api/REST/7.6.1/'
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
		{
			name: 'Internal Stack Overflow',
			link: 'http://stack.web.att.com/'
		},
		{
			name: 'UTM Debugger',
			link: 'http://zlp32165.vci.att.com:32599/utm-ui/index.html#'
		},
	];
	
}