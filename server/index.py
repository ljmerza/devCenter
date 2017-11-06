#!/usr/bin/python3

import AutomationBot
import threading
import os
import time
import datetime
import sys

sys.path.append('Common')
sys.path.append('Crucible')
sys.path.append('Jira')
sys.path.append('Flask')

from Jira.Jira import Jira
from Crucible import Crucible
from Flask import DevCenterServer

jira_obj = Jira()
crucible_obj = Crucible()

delay_time = 2
debug = False

start_bot = True
start_server = True
start_threads = True
devdb = False


if 'debug' in sys.argv:
	debug = True
if 'server' in sys.argv:
	start_bot = False
if 'bot' in sys.argv:
	start_server = False
if 'single' in sys.argv:
	start_threads = False
if 'devdb' in sys.argv:
	devdb = True

print(f'''
	debug {debug}
	start_bot {start_bot}
	start_server {start_server}
	start_threads {start_threads}
''')

def start_bots():
	automationBot = AutomationBot.AutomationBot(
		is_beta_week=0, is_qa_pcr=0, beta_stat_ping_now=0, debug=debug, merge_alerts=0, jira_obj=jira_obj, crucible_obj=crucible_obj)
	
	while True:
		# if between 6am-7pm monday-friday then update tickets else wait a minute
		d = datetime.datetime.now()
		if d.hour in range(6, 19) and d.isoweekday() in range(1, 6):   
			response = automationBot.update_jira()

			# print error is status not okay
			if not response['status']:
				print('ERROR:', response['data'])

			time.sleep(delay_time)

		else:
			time.sleep(60)

if start_threads:
	# if not windows then use fork
	if os.name != 'nt':
		# create cron
		newpid = os.fork()
		if newpid == 0:
			if start_bot:
				start_bots()
		else:
			if start_server:
				DevCenterServer.start_server(debug=debug, jira_obj=jira_obj, crucible_obj=crucible_obj)

	else:
		# else use threading
		if start_bot:
			t = threading.Thread(target=start_bots)
			t.start()
		if start_server:
			DevCenterServer.start_server(debug=debug, jira_obj=jira_obj, crucible_obj=crucible_obj)
else:
	# else use threading
	if start_bot:
		start_bots()
	if start_server:
		DevCenterServer.start_server(debug=debug, jira_obj=jira_obj, crucible_obj=crucible_obj)