#!/usr/bin/python3

import AutomationBot
import time
import threading

import sys
sys.path.append('Common')
sys.path.append('Crucible')
sys.path.append('Jira')


def start_bots():
	automationBot = AutomationBot.AutomationBot(is_beta_week=0, is_qa_pcr=0, beta_stat_ping_now=0, debug=0, merge_alerts=0)
	
	print('starting bots...')
	while(1):
		automationBot.update_jira()
		time.sleep(30)

t = threading.Thread(target=start_bots)
t.daemon = True
t.start()


from Flask import DevCenterServer
DevCenterServer.start_server(debug=1)

