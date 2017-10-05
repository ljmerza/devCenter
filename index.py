import automationBot
import time
import threading

# jira/crucible username and password
once = False
debug = True

def start_bots():
	global once
	autobot = automationBot.AutomationBot(
		is_beta_week=1, is_qa_pcr=1, want_time_reminders=0, beta_stat_ping_now=0, debug=debug, show_ascii=0, merge_alerts=0)
	
	if not once:
		print('starting bots...')
		while(1):
			once = True
			autobot.update_jira()
			time.sleep(30)

# t = threading.Thread(target=start_bots)
# t.daemon = True
# t.start()

import server
server.start_server(debug)