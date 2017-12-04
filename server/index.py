#!/usr/bin/python3

import AutomationBot
import threading
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

from Flask import DevCenterServer
from Common.DevCenterSQL import DevCenterSQL

#################################### 
error_log = False
devflk = True

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
	error_log = True

# allow error logging
if 'error_log' in sys.argv:
	error_log = True

# only use flask server on one thread
if 'devserver' in sys.argv:
	start_bot = False
	start_threads = False

# use prod flask server
if 'prodflk':
	devflk = False



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
		devbot=devbot, is_qa_pcr=is_qa_pcr, merge_alerts=merge_alerts
	)

	while True:
		# if between 6am-7pm monday-friday then update tickets else wait a minute
		# prod server is in GMT so time shift if we are in prod mode
		d = datetime.datetime.now()
		if d.hour in range(6+time_shift, 19+time_shift) and d.isoweekday() in range(1, 6):
			response = automationBot.update_jira()

			if not response['status']:
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
				DevCenterServer.start_server(devflk=devflk, host=host)

	else:
		# else use threading
		if start_bot:
			thr = threading.Thread(target=start_bots)
			thr.start()
		if start_server:
			thr = threading.Thread(target=DevCenterServer.start_server, kwargs={'devflk':devflk, 'host':host})
			thr.start()

else:
	# else only allow single thread/process
	if start_server:
		DevCenterServer.start_server(devflk=devflk, host=host)
	if start_bot:
		start_bots()