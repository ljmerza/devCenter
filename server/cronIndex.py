#!/usr/bin/python3

import os
import time
import datetime
import sys

import requests

sys.path.append('Common')
sys.path.append('Chat')
sys.path.append('Crucible')
sys.path.append('Jira')
sys.path.append('Flask')


import AutomationBot
from Common.DevCenterSQL import DevCenterSQL

########################################################################
error_log = False
devbot = True
devdb = True
time_shift = 0
is_beta_week = False
is_qa_pcr = False
beta_stat_ping_now = False
merge_alerts = False
sql_echo = False
########################################################################
host = '127.0.0.1'
port = 5859

# allow pcr/qa pings and beta stats
if 'beta' in sys.argv:
	is_qa_pcr = True
	is_beta_week = True

# allow for merge pings
if 'merge' in sys.argv:
	merge_alerts = True

# ping beta stats now
if 'betanow' in sys.argv:
	beta_stat_ping_now = True

# shift time to GMT, use prod db, use prod chat
if 'prod' in sys.argv:
	time_shift = 4
	devdb = False
	devbot = False
	error_log = True
	host = '0.0.0.0'
	port = 5858

# allow error logging
if 'error_log' in sys.argv:
	error_log = True

# allow echoing of SQL
if 'sql' in sys.argv:
	sql_echo = True
########################################################################

# start CRON instance
automationBot = AutomationBot.AutomationBot(
	is_beta_week=is_beta_week, beta_stat_ping_now=beta_stat_ping_now, error_log=error_log,
	devbot=devbot, is_qa_pcr=is_qa_pcr, merge_alerts=merge_alerts, devdb=devdb, sql_echo=sql_echo
)

########################################################################

while True:
	# if between 6am-7pm monday-friday then update tickets else wait a minute
	# prod server is in GMT so time shift if we are in prod mode
	d = datetime.datetime.now()
	if d.hour in range(6+time_shift, 19+time_shift) and d.isoweekday() in range(1, 6):
		response = automationBot.update_jira()

		# if error print it else send updated data to sockets
		if not response['status']:
			print('ERROR:', response['data'])
		else:
			session = requests.session()
			session.trust_env=False
			response = session.post(url=f"http://{host}:{port}/dev_center/socket_tickets", json=response)


	else:
		time.sleep(60)

########################################################################