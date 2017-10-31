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

from Jira import Jira
from Crucible import Crucible
from Flask import DevCenterServer


jira_obj = Jira()
crucible_obj = Crucible()

# how many seconds between queries to Jira
cron_delay = 1
bot_delay = 20



def start_bots(is_cron, delay_time):
	automationBot = AutomationBot.AutomationBot(
		is_beta_week=0, is_qa_pcr=0, beta_stat_ping_now=0, debug=0, merge_alerts=0, jira_obj=jira_obj, crucible_obj=crucible_obj, is_cron=is_cron)
	
	process_type = 'CRON' if is_cron else 'BOTS'
	print(f' * Starting {process_type} with {delay_time} second delay time')
	while True:

		# if between 6am-7pm monday-friday then update tickets else wait a minute
		d = datetime.datetime.now()
		if d.hour in range(6, 19) and d.isoweekday() in range(1, 6):   
			automationBot.update_jira()
			time.sleep(delay_time)
		else:
			time.sleep(60)




# if not windows then use fork
if os.name != 'nt':
	# create cron
	newpid = os.fork()
	if newpid == 0:
		start_bots(is_cron=True, delay_time=cron_delay)
	# create bots
	newpid = os.fork()
	if newpid == 0:
		start_bots(is_cron=False, delay_time=bot_delay)
	else:
		DevCenterServer.start_server(debug=0, jira_obj=jira_obj, crucible_obj=crucible_obj)

else:
	# else use threading
	t = threading.Thread(target=start_bots, args=[True, cron_delay])
	t.start()
	t = threading.Thread(target=start_bots, args=[False, bot_delay])
	t.start()
	DevCenterServer.start_server(debug=0, jira_obj=jira_obj, crucible_obj=crucible_obj)