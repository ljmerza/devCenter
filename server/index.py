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


def start_bots():
	automationBot = AutomationBot.AutomationBot(
		is_beta_week=0, is_qa_pcr=0, beta_stat_ping_now=0, debug=True, merge_alerts=0, jira_obj=jira_obj, crucible_obj=crucible_obj)
	
	# while True:
	# 	# if between 6am-7pm monday-friday then update tickets else wait a minute
	# 	d = datetime.datetime.now()
	# 	if d.hour in range(6, 19) and d.isoweekday() in range(1, 6):   
	# 		response = automationBot.update_jira()

	# 		# print error is status not okay
	# 		if not response['status']:
	# 			print('ERROR:', response['data'])

	# 		time.sleep(delay_time)

	# 	else:
	# 		time.sleep(60)

if debug:
	print('..........RUNNING IN DEBUG MODE..........')


# if not windows then use fork
if os.name != 'nt':
	# create cron
	newpid = os.fork()
	if newpid == 0:
		start_bots()
	else:
		DevCenterServer.start_server(debug=debug, jira_obj=jira_obj, crucible_obj=crucible_obj)

else:
	# else use threading
	t = threading.Thread(target=start_bots)
	t.start()
	DevCenterServer.start_server(debug=debug, jira_obj=jira_obj, crucible_obj=crucible_obj)