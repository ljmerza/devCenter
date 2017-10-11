#!/usr/bin/python3
import time
import threading

import AutomationBot
from Flask import DevCenterServer

debug = True

def start_bots():
	automationBot = AutomationBot.AutomationBot(is_beta_week=1, is_qa_pcr=1, beta_stat_ping_now=0, debug=debug, merge_alerts=0)

	while(1):
		automationBot.update_jira()
		time.sleep(30)


t = threading.Thread(target=start_bots)
t.daemon = True
t.start()


DevCenterServer.start_server(debug)