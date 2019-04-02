#!/usr/bin/python3
"""Start Dev Center."""
import argparse
import datetime
import logging
import os
import sys
import threading

from devcenter.const import __version__
from devcenter.AutomationBot import AutomationBot
from devcenter.DevCenterServer import start_server


_LOGGER = logging.getLogger(__name__)

sql_echo = False
devserver = True
devdb = True
host = '127.0.0.1'
port = 0
dev_chat = True
is_beta_week = False
is_qa_pcr = False
beta_stat_ping_now = False
no_pings = False
devbot = True
time_shift = 0
merge_alerts = False
prodmode = False


def get_arguments() -> argparse.Namespace:
	"""Get parsed passed in arguments."""
	parser = argparse.ArgumentParser(
        description="Dev Center")
	parser.add_argument('--version', action='version', version=__version__)

	parser.add_argument('--betanow', 
		help='Makes ping for beta week stats now', 
		action='store_true')
	parser.add_argument('--devui', 
		help='Start in development mode', 
		action='store_true')
	parser.add_argument('--betaui', 
		help='Start in beta mode', 
		action='store_true')
	parser.add_argument('--prod', 
		help='Start in production mode', 
		action='store_true')
	parser.add_argument('--prodflk', 
		help='Start in prod flask mode', 
		action='store_true')
	parser.add_argument('--nopings', 
		help='Disable all pings', 
		action='store_true')
	parser.add_argument('--prodserver', 
		help='Start server in production mode', 
		action='store_true')
	parser.add_argument('--beta', 
		help='Start in beta week mode')
	parser.add_argument('--merge', 
		help='Allow merge alert pings to chatroom', 
		action='store_true')
	parser.add_argument('--sql', 
		help='Enables echoing of SQL', 
		action='store_true')
	parser.add_argument('--prodChat', 
		help='Enable production chat messages', 
		action='store_true')

	arguments = parser.parse_args()
	return arguments


def set_argument_groups() -> None:
	"""Sets arguments groups for starting dev center."""
	global host, port, devdb, time_shift, devserver, dev_chat, devbot, prodmode, no_pings, is_qa_pcr, is_beta_week, merge_alerts, sql_echo

	arguments = get_arguments()

	if arguments.betanow:
		beta_stat_ping_now = True

	if arguments.devui:
		host = '0.0.0.0'
		port = 5859
		logging.basicConfig(level=logging.INFO)

	if arguments.betaui:
		host = '0.0.0.0'
		port = 5860
		devdb = False
		time_shift = 4

	if arguments.prod:
		devdb = False
		host = '0.0.0.0'
		port = 5858
		devserver = False
		dev_chat = False
		time_shift = 4
		devbot = False
		prodmode= True

	if arguments.nopings:
		no_pings = True

	if arguments.prodflk:
		devserver = False

	if arguments.beta:
		is_qa_pcr = True
		is_beta_week = True

	if arguments.merge:
		merge_alerts = True

	if arguments.sql:
		sql_echo = True

	if arguments.prodChat:
		dev_chat = False


def start_cron():
	"""Start the Jira cron."""
	_LOGGER.info("Starting cron...")

	automation_bot = AutomationBot.AutomationBot(
		is_beta_week=is_beta_week, beta_stat_ping_now=beta_stat_ping_now, no_pings=no_pings,
		devbot=devbot, is_qa_pcr=is_qa_pcr, merge_alerts=merge_alerts, devdb=devdb, sql_echo=sql_echo
	)

	while True:
		# if between 6am-7pm monday-friday EST then update tickets else wait a minute
		# prod server is in GMT so time shift if we are in prod mode
		d = datetime.datetime.nowuct()
		if d.hour in range(6+time_shift, 19+time_shift) and d.isoweekday() in range(1, 6):
			response = automation_bot.update_jira()

			if not response['status']:
				_LOGGER.info(response['data'])


def main() -> None:
	"""Start Dev Center."""
	set_argument_groups()

	if prodmode:
		thr = threading.Thread(target=start_cron)
		thr.start()

	print(f"{host}:{port}")

	start_server(
		devflk=devserver, host=host, port=port, 
		app_name='dev_center', dev_chat=dev_chat, 
		devdb=devdb, sql_echo=sql_echo, no_pings=False
	)

main()
# if __name__ == "__main__":
#     # sys.exit(main())
# 	main()