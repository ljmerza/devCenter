#!/usr/bin/python3
import os
import time
import datetime
import sys
import requests

PACKAGE_PARENT = '..'
SCRIPT_DIR = os.path.dirname(os.path.realpath(
    os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))

from .AutomationBot import AutomationBot

########################################################################
devbot = True
devdb = True
time_shift = 0
is_beta_week = False
is_qa_pcr = False
beta_stat_ping_now = False
merge_alerts = False
sql_echo = False
no_pings = False
########################################################################
host = '127.0.0.1'
port = 5859

if 'prodhost' in sys.argv:
	host = '0.0.0.0'

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
	host = '0.0.0.0'
	port = 5858

# allow echoing of SQL
if 'sql' in sys.argv:
	sql_echo = True

if 'nopings' in sys.argv:
	no_pings = True

########################################################################
automationBot = AutomationBot(
	is_beta_week=is_beta_week, beta_stat_ping_now=beta_stat_ping_now, no_pings=no_pings,
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


########################################################################