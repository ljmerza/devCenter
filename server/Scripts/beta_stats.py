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
	if component == 'BETA':
		print(" {0:20}  {1:30} {2}".format(msrp,  status, summary))
	elif component:
		if component == 'PCR - Completed':
			print(" {0:20} {1:28} {2}".format(msrp, component, summary))
		else:
			print(" {0:20} {1:30} {2}".format(msrp, component, summary))
	elif status == 'Backlog':
		print(" {0:20} {1:34} {2}".format(msrp, status, summary))
	elif status == 'Triage':
		print(" {0:20} {1:36} {2}".format(msrp, status, summary))
	elif status == 'In Sprint':
		print(" {0:20} {1:37} {2}".format(msrp, status, summary))
	elif status == 'In QA':
		print(" {0:20} {1:36} {2}".format(msrp, status, summary))
	elif status == 'In Development':
		print(" {0:20} {1:30} {2}".format(msrp, status, summary))
	else:
		print(" {0:20} {1:30} {2}".format(msrp, status, summary))

print('------------------------------------------------')
print('Total:', len(jira_tickets['data']) )
