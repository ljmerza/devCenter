

let config = {
	pcr: 'project+in+(AQE,+%22Taskmaster+Dashboard%22,+TeamDB,+TQI,+%22Unified+Desktop%22,+UPM,+WAM,+SASHA)+AND+status+!%3D+closed+AND+component+in+(%22PCR+-+Needed%22)',
	beta:'project+in+(AQE,+%22Taskmaster+Dashboard%22,+TeamDB,+TQI,+%22Unified+Desktop%22,+UPM,+WAM)+AND+status+!%3D+closed+AND+labels+%3D+BETA',
	cr:'project+in+(AQE,+%22Taskmaster+Dashboard%22,+TeamDB,+TQI,+%22Unified+Desktop%22,+UPM,+WAM)+AND+component+in+(%22PCR+-+Completed%22)+AND+type+!%3D+%22Technical+task%22+AND+Status+%3D+%22code+review%22',
	qa:'project+in+(AQE,+%22Taskmaster+Dashboard%22,+TeamDB,+TQI,+%22Unified+Desktop%22,+UPM,+WAM)+AND+status+!%3D+closed+AND+status+in+(%22Ready+for+QA%22,+%22IN+QA%22)',
	uctready:'project+in+(AQE,+%22Customer+DB%22,+%22Desktop+Integration%22,+%22Taskmaster+Dashboard%22,+TeamDB,+TQI,+UPM,+%22Unified+Desktop%22,+WAM)+AND+status+!%3D+closed+AND+issuetype+!%3D+Epic+AND+status+%3D+%22Ready+for+UCT%22+AND+type+!%3D+%22Technical+task%22+AND+type+!%3D+Sub-task+AND+assignee+!%3D+ja2892',
	allopen:'project%20in%20(AQE%2C%20"Auto%20QM"%2C%20"Customer%20DB"%2C%20"Manager%20DB"%2C%20"Taskmaster%20Dashboard"%2C%20TeamDB%2C%20TQI%2C%20"Unified%20Desktop"%2C%20UPM%2C%20WAM)%20AND%20status%20in%20("IN%20DEVELOPMENT"%2C%20"IN%20SPRINT"%2C%20"Ready%20for%20Release"%2C%20"Code%20Review"%2C%20"Ready%20For%20QA"%2C%20"IN%20QA"%2C%20"READY%20FOR%20UCT")%20OR%20assignee%20in%20(wc591w%2C%20ep759g)%20ORDER%20BY%20due%20DESC',
	teamdb_ember:'labels%3DNewGUI',
	apollo:'"Epic%20Link"%20%3D%20Apollo%20and%20status%20!%3D%20closed',
	sme:'(sprint%20in%20(3187%2C%203183%2C%203182%2C%203676%2C%203185%2C%203180%2C%203684%2C%203186%2C%203432%2C%203968)%20OR%20assignee%20in%20(dh6094%2C%20bb486m%2C%20cc216t%2C%20jc001b%2C%20bp215n%2C%20tt0163%2C%20sm6821%2C%20br591w%2C%20sr6855%2C%20na0952))%20AND%20status%20!%3D%20closed',
	scrum:'project%20in%20(AQE%2C%20"Desktop%20Integration"%2C%20TeamDB%2C%20TQI%2C%20"Unified%20Desktop"%2C%20UPM%2C%20WAM)%20AND%20status%20!%3D%20closed',

	allmy: function(username){
		return `assignee%20%3D%20${username}%20ORDER%20BY%20updated%20DESC`;
	},

	mytickets: function(username){
		return `assignee%20%3D%20${username}%20AND%20resolution%20%3D%20unresolved%20ORDER%20BY%20priority%20DESC%2C%20created%20ASC`;
	},

	jiraUrl: 'https://jira.web.att.com:8443',
	crucibleUrl: 'https://icode3.web.att.com',
	codeCloudUrl: 'https://codecloud.web.att.com',

	devUrl: 'http://m5devacoe01.gcsc.att.com',
	betaUrl: 'http://chrapud16b.gcsc.att.com',
	wikiUrl: 'https://wiki.web.att.com',

	chatUrl: 'qto://talk',

	fields: 'customfield_10109,status,customfield_10212,summary,assignee,components,timetracking,duedate,comment,updated,created,customfield_10102,customfield_10175,customfield_10103,customfield_10602'

}


export default config;