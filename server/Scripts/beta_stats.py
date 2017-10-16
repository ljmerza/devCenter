#!/usr/bin/python3
import sys
import base64
import os
import datetime

sys.path.append('../Jira')
sys.path.append('../Common')
sys.path.append('../Crucible')

import Jira
jira_obj = Jira.Jira()

# create auth header
attuid = os.environ['USER']
password = os.environ['PASSWORD']
header_value = f'{attuid}:{password}'
encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
cred_hash = f'Basic {encoded_header}'

# get jira data
jira_tickets = jira_obj.get_jira_tickets(filter_number=11004, cred_hash=cred_hash)


date_now = datetime.datetime.now().strftime('%m/%d %H:%M')
print('Reported issues (', date_now,'EST )')
print('------------------------------------------------')

# print table data
for jira_ticket in jira_tickets['data']:

	# get ticket data
	component = jira_ticket['component']
	status = jira_ticket['status']
	summary = jira_ticket['summary']
	msrp = jira_ticket['msrp']

	# print table
	if component in ['Code Review - Working']:
		print(" {0:20} {1:28} {2}".format(msrp, 'Code Review - Working', summary))
	elif component in ['PCR - Completed']:
		print(" {0:20} {1:28} {2}".format(msrp, 'PCR - Completed', summary))
	elif component in ['Merge Code']:
		print(" {0:20} {1:32} {2}".format(msrp, 'PCR - Completed', summary))

	elif status in ['Ready for Release']:
		print(" {0:20} {1:28} {2}".format(msrp, status, summary))
	elif status in ['In Development']:
		print(" {0:20} {1:30} {2}".format(msrp, status, summary))
	elif status in ['On Hold', 'Backlog']:
		print(" {0:20} {1:35} {2}".format(msrp, status, summary))
	elif status in ['Triage', 'In QA', 'In UCT']:
		print(" {0:20} {1:36} {2}".format(msrp, status, summary))
	elif status in ['In Sprint']:
		print(" {0:20} {1:37} {2}".format(msrp, status, summary))
	else:
		print(" {0:20} {1:30} {2}".format(msrp, status, summary))

print('------------------------------------------------')
print('Total:', len(jira_tickets['data']) )


print("""


Triage                                hasn't been looked at
Backlog                             has been looked at but not assigned to a developer
In Sprint                             assigned to a developer but hasn't been started
In Development                  developer is working on it
PCR - Needed                   developer is wait for peer to review code
PCR - Completed               peer code review complete and waiting for senior developer to look at it
Code Review                     waiting for a senior developer to look at code
Code Review - Working     senior developer is looking at code
QA Needed                        waiting for testing
In QA                                 currently being tested
Merge Code                       waiting for developer to add code to beta
Ready for UCT                   waiting for next beta update
Ready for Release             has been tested in beta
On Hold                              ticket is on hold

""")
