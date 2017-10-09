#!/usr/bin/python3
import sys
sys.path.append('..')

from Jira import Jira

jira_obj = Jira.Jira()
jira_obj.login()
jira_obj.get_jira_data(11004)

# get jira data
jira_data = jira_obj.return_jira_data()

attuid = jira_data['attuids']
key = jira_data['keys']
msrp = jira_data['msrps']
status = jira_data['statuses']
component = jira_data['components']
summary = jira_data['summaries']
story_point = jira_data['story_points']
sprint = jira_data['sprints']
qa_steps = jira_data['qa_steps']
comments = jira_data['comments']

# print table data
for i in range(len(key)):
	if component[i] == 'BETA':
		print(" {0:20}  {1:30} {2}".format(msrp[i],  status[i], summary[i]))
	elif component[i]:
		if component[i] == 'PCR - Completed':
			print(" {0:20} {1:27} {2}".format(msrp[i], component[i], summary[i]))
		else:
			print(" {0:20} {1:30} {2}".format(msrp[i], component[i], summary[i]))
	elif status[i] == 'Backlog':
		print(" {0:20} {1:35} {2}".format(msrp[i], status[i], summary[i]))
	elif status[i] == 'Triage':
		print(" {0:20} {1:40} {2}".format(msrp[i], status[i], summary[i]))
	elif status[i] == 'In Sprint':
		print(" {0:20} {1:37} {2}".format(msrp[i], status[i], summary[i]))
	else:
		print(" {0:20} {1:30} {2}".format(msrp[i], status[i], summary[i]))
