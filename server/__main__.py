#!/usr/bin/python3

import sys
import os
import threading
import datetime
import logging

import DevCenterServer
from AutomationBot import AutomationBot

logging.basicConfig(level=logging.INFO)

sql_echo = False
devflk = True
devdb = True
host = '127.0.0.1'
port = 0
app_name = 'dev_center'
dev_chat = True
is_beta_week = False
is_qa_pcr = False
beta_stat_ping_now = False
no_pings = False
devbot = True
time_shift = 0
merge_alerts = False

# ping beta stats now
if 'betanow' in sys.argv:
	beta_stat_ping_now = True

if 'devui' in sys.argv:
	host = '0.0.0.0'
	port = 5859

if 'betaui' in sys.argv:
	host = '0.0.0.0'
	port = 5860
	devdb = False
	time_shift = 4

if 'prod' in sys.argv:
	devdb = False
	host = '0.0.0.0'
	port = 5858
	devflk = False
	dev_chat = False
	time_shift = 4
	devbot = False

if 'nopings' in sys.argv:
	no_pings = True

# use prod flask server
if 'prodflk' in sys.argv:
	devflk = False

if 'beta' in sys.argv:
	is_qa_pcr = True
	is_beta_week = True

# allow for merge pings
if 'merge' in sys.argv:
	merge_alerts = True

# allow echoing of SQL
if 'sql' in sys.argv:
	sql_echo = True

# allow prod chat messages
if 'prodChat' in sys.argv:
	dev_chat = False

logging.info('args:', sys.argv)
if not port:
	exit()

def start_cron():
	automationBot = AutomationBot(
		is_beta_week=is_beta_week, beta_stat_ping_now=beta_stat_ping_now, no_pings=no_pings,
		devbot=devbot, is_qa_pcr=is_qa_pcr, merge_alerts=merge_alerts, devdb=devdb, sql_echo=sql_echo
	)

	while True:
		# if between 6am-7pm monday-friday then update tickets else wait a minute
		# prod server is in GMT so time shift if we are in prod mode
		d = datetime.datetime.now()
		if d.hour in range(6+time_shift, 19+time_shift) and d.isoweekday() in range(1, 6):
			response = automationBot.update_jira()

			if not response['status']:
				logging.info(response['data'])

thr = threading.Thread(target=start_cron)
thr.start()

# start flask server
DevCenterServer.start_server(
	devflk=devflk, host=host, port=port, 
	app_name=app_name, dev_chat=dev_chat, 
	devdb=devdb, sql_echo=sql_echo,
	no_pings=False
)
