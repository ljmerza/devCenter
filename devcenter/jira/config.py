all_open_tickets = 'project in (AQE, "Auto QM", "Customer DB", "Manager DB", "Taskmaster Dashboard", TeamDB, TQI, "Unified Desktop", UPM, WAM) AND (status in ("ON HOLD", "IN DEVELOPMENT", "IN SPRINT", "Ready for Release", "Code Review", "QA Ready", "In UAT", "READY FOR UCT", "PCR READY", "CR Ready", "UAT Ready", "In PCR", "In QA") OR assignee in (wc591w) OR (labels = beta AND status != closed))'

fields = 'customfield_10109,comment,status,customfield_10212,summary,assignee,components,timeoriginalestimate,customfield_10001,customfield_10002,label,fixVersions,duedate,created,updated,customfield_10108,customfield_10102,customfield_10175,customfield_10103,customfield_10602,timetracking,labels,attachment,issuelinks,issuetype,customfield_10810,environment,priority,customfield_10812,customfield_10300,description,customfield_10138,worklog,epic_link'

cron_fields='customfield_10212,status,summary,assignee,components,timeoriginalestimate,fixVersions,labels,customfield_10138,epic_link'

projects ='project in (AQE, "Taskmaster Dashboard", TeamDB, TQI, "Unified Desktop", UPM, WAM) '

filters = {
	'beta': projects+' AND status != closed AND labels = BETA', 
	'qa':projects+' AND status in ("QA Ready")', 
	'cr':projects+' AND status in ("CR Ready")', 
	'uct':projects+' AND status in ("UAT READY")', 
	'pcr': projects+' AND (status in ("PCR READY") OR status in ("In PCR") AND component in ("PCR - Needed"))'
}
