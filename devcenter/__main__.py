#!/usr/bin/python3
"""Start Dev Center."""
import argparse
import datetime
import logging
import os
import sys
import threading

from devcenter.const import __version__
from devcenter.automation_bot import AutomationBot
from devcenter.devcenter_server import start_server


_LOGGER = logging.getLogger(__name__)
TIME_SHIFT = int(os.environ.get('TIME_SHIFT', 0))
ENABLE_CRON = int(os.environ.get('ENABLE_CRON', 0))

def start_cron():
	"""Start the Jira cron."""
	_LOGGER.info("Starting cron...")

	automation_bot = AutomationBot()

	while True:
		# if between 6am-7pm monday-friday EST then update tickets else wait a minute
		# prod server is in GMT so time shift if we are in prod mode
		d = datetime.datetime.utcnow()
		if d.hour in range(6+TIME_SHIFT, 19+TIME_SHIFT) and d.isoweekday() in range(1, 6):
			response = automation_bot.update_jira()

			if not response['status']:
				_LOGGER.info(response['data'])


def main() -> None:
	"""Start Dev Center."""
	if ENABLE_CRON:
		thr = threading.Thread(target=start_cron)
		thr.start()

	start_server()

main()