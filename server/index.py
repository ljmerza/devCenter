#!/usr/bin/python3

import time
import threading

import AutomationBot
# from Flask import DevCenterServer

# DevCenterServer.start_server(debug=0)

automationBot = AutomationBot.AutomationBot(is_beta_week=1, is_qa_pcr=1, beta_stat_ping_now=0, debug=0, merge_alerts=0)

while(1):
	automationBot.update_jira()
	time.sleep(30)


