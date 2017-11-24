#!/usr/bin/python3

import AutomationBot
import multiprocessing
import os
import time
import datetime
import sys

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit

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
error_log = False
devflk = False

# default to dev chat and db
devbot = True
devdb = True

start_bot = True
start_server = True
start_threads = True
time_shift = 0

is_beta_week = False
is_qa_pcr = False
beta_stat_ping_now = False
merge_alerts = False

host = '127.0.0.1'
####################################
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
	host = '0.0.0.0'

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
chat_obj = Chat(debug=devbot, is_qa_pcr=is_qa_pcr, merge_alerts=merge_alerts)
##################################################
# flask settings and start up
root_dir = os.path.dirname(os.getcwd())

app = Flask(__name__, template_folder=os.path.abspath('../templates'), static_folder=os.path.abspath('../'))
cors = CORS(app)

# set CORS headers
app.config['CORS_HEADERS'] = 'Content-Type'

# set debug if we want it
if devflk:
	app.config['DEBUG'] = True
	app.config['TEMPLATES_AUTO_RELOAD'] = True

#########################################################

def start_bots():
	'''create automation bot instance and websockets
	starts cron in forever loop pushing tickets to websocket

	Args:
		None

	Returns:
		None
	'''
	automationBot = AutomationBot.AutomationBot(
		is_beta_week=is_beta_week, beta_stat_ping_now=beta_stat_ping_now, error_log=error_log, 
		jira_obj=jira_obj, crucible_obj=crucible_obj, sql_object=sql_object, chat_obj=chat_obj
	)

	while True:
		# if between 6am-7pm monday-friday then update tickets else wait a minute
		# prod server is in GMT so time shift if we are in prod mode
		d = datetime.datetime.now()
		if d.hour in range(6+time_shift, 19+time_shift) and d.isoweekday() in range(1, 6):
			response = automationBot.update_jira()

			# send tickets or print error message
			if response['status']:
				socketio.emit('pcr_tickets', response['data']['pcrs'])
				socketio.emit('qa_tickets', response['data']['qas'])
			else:
				print('ERROR:', response['data'])

		else:
			time.sleep(60)


##################################################
# optional thread/fork creation

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
				DevCenterServer.start_server(host=host, app=app, jira_obj=jira_obj, crucible_obj=crucible_obj)

	else:
		# else use threading
		if start_bot:
			t = multiprocessing.Process(target=start_bots)
			t.start()
		if start_server:
			DevCenterServer.start_server(host=host, app=app, jira_obj=jira_obj, crucible_obj=crucible_obj)

else:
	# else only allow single thread/process
	if start_server:
		DevCenterServer.start_server(host=host, app=app, jira_obj=jira_obj, crucible_obj=crucible_obj)
	if start_bot:
		start_bots()