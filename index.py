import automationBot
import time
import threading

debug = True

def start_bots():
	autobot = automationBot.AutomationBot(
		is_beta_week=1, is_qa_pcr=1, want_time_reminders=0, beta_stat_ping_now=0, debug=debug, show_ascii=0, merge_alerts=0)

	while(1):
		autobot.update_jira()
		time.sleep(30)

# t = threading.Thread(target=start_bots)
# t.daemon = True
# t.start()

import server
server.start_server(debug)