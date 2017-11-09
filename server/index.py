#!/usr/bin/python3

import AutomationBot
import threading
import os
import time
import datetime
import sys
import websocket

sys.path.append('Common')
sys.path.append('Crucible')
sys.path.append('Jira')
sys.path.append('Flask')

from Jira.Jira import Jira
from Crucible import Crucible
from Flask import DevCenterServer
from Common import DevCenterSQL
from Common.Chat import Chat


#################################### 
delay_time = 2
error_log = False
devflk = False

# default to dev chat and db
devbot = True
devdb = True

start_bot = True
start_server = True
start_threads = True
time_shift = 0
####################################

# only start Flask
if 'server' in sys.argv:
	start_bot = False
# only start cron
if 'cron' in sys.argv:
	start_server = False
# only allow one thread
if 'single' in sys.argv:
	start_threads = False

# shift time to GMT, use prod db, use prod chat
if 'prod' in sys.argv:
	time_shift = 4
	devdb = False
	devbot = False

# allow error logging
if 'error_log' in sys.argv:
	error_log = True
# use dev Flask
if 'devflk' in sys.argv:
	devflk = True
# only use flask server, one thread, debug mode for Flask
if 'devserver' in sys.argv:
	start_bot = False
	start_threads = False
	devflk = True

##################################################
# create instance for DI
jira_obj = Jira()
crucible_obj = Crucible()
sql_object = DevCenterSQL.DevCenterSQL()
chat_obj = Chat(debug=devbot, is_qa_pcr=0, merge_alerts=0)
##################################################

def start_bots():
	'''create automation bot instance and websockets
	starts cron in forever loop pushing tickets to websocket

	Args:
		None

	Returns:
		None
	'''
	automationBot = AutomationBot.AutomationBot(
		is_beta_week=1, beta_stat_ping_now=1, error_log=error_log, 
		jira_obj=jira_obj, crucible_obj=crucible_obj, sql_object=sql_object, chat_obj=chat_obj)
	
	websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://echo.websocket.org/")
    ws.on_open = on_open
    ws.run_forever()

	while True:
		# if between 6am-7pm monday-friday then update tickets else wait a minute
		# prod server is in GMT so time shift if we are in prod mode
		d = datetime.datetime.now()
		if d.hour in range(6+time_shift, 19+time_shift) and d.isoweekday() in range(1, 6): 
			print('test')  
			response = automationBot.update_jira()

			# print error is status not okay or send tickets to sockets
			if not response['status']:
				print('ERROR:', response['data'])
			else:
				ws.send(response)

			# wait for next iteration
			time.sleep(delay_time)

		else:
			time.sleep(60)


# if we want threads then create them
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
				DevCenterServer.start_server(debug=devflk, jira_obj=jira_obj, crucible_obj=crucible_obj)

	else:
		# else use threading
		if start_bot:
			t = threading.Thread(target=start_bots)
			t.start()
		if start_server:
			DevCenterServer.start_server(debug=devflk, jira_obj=jira_obj, crucible_obj=crucible_obj)

else:
	# else only allow single thread/process
	if start_bot:
		start_bots()
	if start_server:
		DevCenterServer.start_server(debug=devflk, jira_obj=jira_obj, crucible_obj=crucible_obj)