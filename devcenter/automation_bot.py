"""Cron to keep track of Jira tickets."""
import datetime
import logging
import os
import sys
import time
import threading

from .jira.fields import *
from .jira.jira import Jira
from .sql.sql import DevCenterSQL
from .chat.chat import Chat
from .server_utils import generate_cred_hash


class AutomationBot():
	"""Cron to keep track of Jira tickets."""

	def __init__(self):
		"""Setup cron config."""
		self.sql_object = DevCenterSQL()
		self.jira_obj = Jira()
		self.chat_obj = Chat()

		self.beta_wait_time = 300 # how many times to wait for beta message

		# how many times we've waited for beta message - start off with a message
		self.is_beta_week = int(os.environ.get('IS_BETA_WEEK', 0))
		beta_stat_ping_now = int(os.environ.get('BETA_STAT_PING_NOW', 0))
		self.beta_wait_count = 0 if beta_stat_ping_now else self.beta_wait_time

		self.cred_hash = generate_cred_hash()
		
	def update_jira(self):
		"""Gets Jira tickets, updates DB, and pings users on updates."""
		try:
			start_get = time.time()

			# get all open Jira tickets
			jira_tickets = self.jira_obj.get_jira_tickets(
				jql=self.jira_obj.jira_api.all_open_tickets, 
				cred_hash=self.cred_hash,
				fields=self.jira_obj.jira_api.cron_fields
			)

			# make sure we have Jira tickets
			if not jira_tickets['status']:
				message = 'Could not get Jira tickets: '+jira_tickets['data']
				self.sql_object.log_error(message=message)
				return {'status': False, 'data': message}

			# print time to retrieve tickets
			end_get = time.time()
			start_bot = time.time()
			logging.info('Processing '+str(len(jira_tickets['data']))+' Jira tickets')
			logging.info('Retrieved Tickets: {:.4}'.format(end_get-start_get))

			# for each jira ticket update DB table
			for jira_ticket  in jira_tickets['data']:
				self.sql_object.update_ticket(jira_ticket=jira_ticket)
			
			# create thread for chatbot to check pings and print time to start thread
			for jira_ticket in jira_tickets['data']:	
				self.check_for_pings(jira_ticket=jira_ticket)

			end_bot = time.time()
			logging.info('Check for pings: {:.4}'.format(end_bot-start_bot))
			start_commit = time.time()

			# set all inactive tickets and print time it took
			self.sql_object.set_inactive_tickets(jira_tickets=jira_tickets)
			end_inactive = time.time()
			logging.info('Set Inactive Tickets: {:.4}'.format(end_inactive-start_commit))		
			
			# if we want to add beta stuff then increment counter
			if self.is_beta_week:
				self.beta_wait_count = self.beta_wait_count + 1
				# if enough time has passed then show beta stats
				if self.beta_wait_count >= self.beta_wait_time:
					self.beta_wait_count = 0
					thr = threading.Thread(target=self.beta_week_stats)
					thr.start()

			# print cron runtime 
			end_cron = time.time()
			logging.info('CRON end time: {:.4}'.format(end_cron-start_get))

			return jira_tickets

		except Exception as err:
			# log error and stack trace
			message = sys.exc_info()[0]
			logging.exception(message)
			return {'status': False, 'data': str(err)}

	def beta_week_stats(self):
		"""Gets beta week stats and pings them."""
		stat_results = {}
		for filter_name, jql in self.jira_obj.jira_api.filters.items():
			jira_tickets = self.jira_obj.get_jira_tickets(cred_hash=self.cred_hash, jql=jql)
			stat_results[filter_name] = jira_tickets['total_tickets']

		self.chat_obj.beta_statistics(**stat_results)
		
	def check_for_pings(self, jira_ticket):
		"""Updates a Jira ticket in the DB and pings any new tickets if it meets the conditions:
			not assigned to a PM, user wants ticket, user hasn't been pinged ticket before."""
		# if user not pinged yet then try
		ticket_exists = self.sql_object.get_ping(field='new_ping', key=jira_ticket['key'])
		if not ticket_exists:
			self.ping_new_ticket(jira_ticket=jira_ticket)
		else:
			# else check for any other pings based on component and status
			self.check_for_status_pings(jira_ticket=jira_ticket)

	def ping_new_ticket(self, jira_ticket):
		"""Checks Jira ticket for any new pings and update DB."""
		# get ticket data
		username = jira_ticket['username']
		story_point = jira_ticket['story_point']
		key = jira_ticket['key']
		msrp = jira_ticket['msrp']
		summary = jira_ticket['summary']
		epic_link = jira_ticket['epic_link']

		# see if user wants ping
		wants_ping = self.sql_object.get_user_ping_value(username=username, field='new_ping')

		# if user wants ping then ping them
		if(wants_ping == 1):
			# send new ticket ping to user and update ping
			self.sql_object.update_ping(key=key, field='new_ping', value=1)

			# get pcr estimate
			pcr_estimate = self.jira_obj.get_pcr_estimate(story_point=story_point)

			# ping ticket to user
			thr = threading.Thread(
				target=self.chat_obj.send_new_ticket, 
				kwargs={
					'key':key, 
					'msrp':msrp, 
					'summary':summary, 
					'story_point':story_point, 
					'pcr_estimate':pcr_estimate, 
					'username': username,
					'epic_link': epic_link
				}
			)
			thr.start()

			# send dev center new ticket ping
			self.ping_dev_center(key=key, summary=summary, username=username, pingType='New Ticket')

		# else if project manager then ping me if not my ticket and update my ping so I don't get it again 
		elif(wants_ping == 2):
			# update ping and get if ive been pinged alraedy
			self.sql_object.update_ping(key=key, field='me_ping', value=1)
			dev_center_pinged = self.sql_object.get_ping(key=key, field='me_ping')

			# ping me if i havent been pinged of this new ticket
			# if(username != self.username and not dev_center_pinged):
			# 	self.ping_dev_center(key=key, summary=summary, username=username, pingType='New Ticket')

		# else user doesn't want ping so update new ping and send dev center the ticket
		else:
			self.sql_object.update_ping(key=key, field='new_ping', value=1)
			# self.ping_dev_center(key=key, summary=summary, username=username, pingType='New Ticket')

	def ping_dev_center(self, key:str, summary:str, username:str, pingType):
		"""Pings the dev center chat about a ticket."""
		thr = threading.Thread(
			target=self.chat_obj.send_dev_center_ticket_info, 
			kwargs={'key':key, 'summary':summary, 'username':username, 'ping_message':pingType}
		)
		thr.start()


	def check_for_status_pings(self, jira_ticket):
		"""Checks Jira ticket component/status for pings needed."""
		# get ticket data
		username = jira_ticket['username']
		story_point = jira_ticket['story_point']
		key = jira_ticket['key']
		msrp = jira_ticket['msrp']
		key = jira_ticket['key']
		sprint = jira_ticket['sprint']
		label = jira_ticket['label']
		summary = jira_ticket['summary']
		component = jira_ticket['component']
		status = jira_ticket['status']
		epic_link = jira_ticket['epic_link']

		# get jira ticket's ping settings
		pings = self.sql_object.get_pings(key=key)

		# safety check - make sure we have data before continuing
		if not pings:
			return False
		
		# if pcr needed and has not been pinged - update db and send ping
		if("PCR READY" in status and not pings.pcr_ping):
			# get PCR estimate
			pcr_estimate = self.jira_obj.get_pcr_estimate(story_point=story_point)
			# send ping
			thr = threading.Thread(
				target=self.chat_obj.send_pcr_needed, 
				kwargs={
				'key':key, 
				'msrp':msrp, 
				'sprint':sprint, 
				'label':label, 
				'pcr_estimate':pcr_estimate,
				'summary':summary
			})
			thr.start()
			# reset ping settings if needed
			self.sql_object.reset_pings(ping_type='pcr_ping', key=key)
			# update ping
			self.sql_object.update_ping(key=key, field='pcr_ping', value=1)

		# if qa needed and has not been pinged - update db and send ping
		elif("QA Ready" in status and not pings.qa_ping):
			thr = threading.Thread(
				target=self.chat_obj.send_qa_needed, 
				kwargs={
					'key':key, 
					'msrp':msrp, 
					'sprint':sprint, 
					'label':label,
					'summary':summary
				}
			)
			thr.start()
			# reset ping settings if needed
			self.sql_object.reset_pings(ping_type='qa_ping', key=key)
			# update ping
			self.sql_object.update_ping(key=key, field='qa_ping', value=1)
		
		# if merge needed and has not been pinged - update db and send ping
		elif("Merge Code" in component and not pings.merge_ping):
			self.ping_jira_status(msrp=msrp, ping_type='merge_ping', username=username, key=key, summary=summary, ping_message='Merge Code', sprint=sprint, epic_link=epic_link)
			
		# if merge conflict and has not been pinged - update db and send ping
		elif("Merge Conflict" in component and not pings.conflict_ping):
			self.ping_jira_status(msrp=msrp, ping_type='conflict_ping', username=username, key=key, summary=summary, ping_message='Merge Conflict', epic_link=epic_link)
		
		# if uct fail and has not been pinged - update db and send ping	
		elif("UAT - Failed" in component and not pings.uct_fail_ping):
			self.ping_jira_status(msrp=msrp, ping_type='uct_fail_ping', username=username, key=key, summary=summary, ping_message='UAT - Failed', epic_link=epic_link)
		
		# if cr fail and has not been pinged - update db and send ping
		elif("Code Review - Failed" in component and not pings.cr_fail_ping):
			self.ping_jira_status(msrp=msrp, ping_type='cr_fail_ping', username=username, key=key, summary=summary, ping_message='Code Review - Failed', epic_link=epic_link)
		
		# if ready in uct, has no merge code component, ticket has already been pinged for merge code and hasnt been pinged for code merged then ping
		elif("UAT Ready" in status and "Merge Code" not in component and pings.merge_ping and not pings.uct_ping):
			self.sql_object.update_ping(key=key, field='uct_ping', value=1)

		# if in dev and already uct pinged then it's a uct fail
		elif( "In Development" in status and pings.uct_ping):
			self.ping_jira_status(msrp=msrp, ping_type='uct_fail_ping', username=username, key=key, summary=summary, ping_message='UCT - Failed', epic_link=epic_link)

		# if in dev but QA pinged then then it's a QA fail
		elif( "In Development" in status and pings.qa_ping):
			self.ping_jira_status(msrp=msrp, ping_type='qa_fail_ping', username=username, key=key, summary=summary, ping_message='QA - Failed', epic_link=epic_link)

	def ping_jira_status(self, msrp, ping_type, username, key, summary, ping_message, sprint='', epic_link=''):
		"""Pings a Jira ticket status to a user if they are setup to get pings."""	
		# see if user wants ping
		wants_ping = self.sql_object.get_user_ping_value(username=username, field=ping_type)
		
		# if user wants ping then ping them
		if(wants_ping == 1):
			thr = threading.Thread(
				target=self.chat_obj.send_jira_update, 
				kwargs={
					'key':key, 
					'msrp':msrp, 
					'summary':summary, 
					'username':username, 
					'ping_message':ping_message, 
					'sprint':sprint,
					'epic_link':epic_link
				}
			)
			thr.start()
		
		# self.ping_dev_center(key=key, summary=summary, username=username, pingType=ping_message)
		self.sql_object.reset_pings(ping_type=ping_type, key=key)
		self.sql_object.update_ping(key=key, field=ping_type, value=1)