#!/usr/bin/python3

import os
import sys
import datetime
import base64
import logging
import time
import threading

from JiraFields import *
from Jira import Jira
from Crucible import Crucible
from DevCenterSQL import DevCenterSQL
from Chat import Chat

class AutomationBot(object):
	'''Handles Scraping data from Jira and Crucible to Store in DB and handle any ping notifications'''

	def __init__(self, is_beta_week, beta_stat_ping_now, devbot, is_qa_pcr, merge_alerts, devdb, sql_echo, no_pings):
		'''

		Args:
			is_beta_week (boolean) 
			beta_stat_ping_now (boolean) 
			devbot (boolean) 
			is_qa_pcr (boolean) 
			merge_alerts (boolean) 
			devdb (boolean) do we use dev db or prod?
			sql_echo (boolean) do we echo all sSQL statements?
			no_pings (boolean) disable all pings from chat

		Returns:

		'''
		self.username = os.environ['USER']
		self.password = os.environ['PASSWORD']
		self.filters = {
			'my_filter':"11502", 
			'beta':'11004', 
			'qa':'11019', 
			'cr':'11007', 
			'uct':'11014', 
			'all':'11002', 
			'pcr':'11128'
		}
		filter_names = ['uct', 'qa', 'cr', 'uct', 'beta', 'pcr']
		################################################################################
		# create DB object and connect
		self.sql_object = DevCenterSQL(devdb=devdb, sql_echo=sql_echo)
		self.jira_obj = Jira()
		self.crucible_obj = Crucible()
		self.chat_obj = Chat(debug=devbot, is_qa_pcr=is_qa_pcr, merge_alerts=merge_alerts, no_pings=no_pings)
		################################################################################
		self.beta_wait_time = 300 # how many times to wait for beta message
		 # how many times we've waited for beta message - start off with a message
		if beta_stat_ping_now:
			self.beta_wait_count = self.beta_wait_time
		else:
			self.beta_wait_count = 0
		self.beta_stats = []
		self.is_beta_week = is_beta_week
		################################################################################
		# cred hash creation
		username = os.environ['USER']
		password = os.environ['PASSWORD']
		header_value = f'{username}:{password}'
		encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
		self.cred_hash = f'Basic {encoded_header}'
		
	def update_jira(self):
		'''Gets Jira tickets, updates DB, and pings users on updates

		Args:
			None

		Returns:
			
		'''
		try:
			start_get = time.time()

			# get all open Jira tickets
			jira_tickets = self.jira_obj.get_jira_tickets(
				jql=self.jira_obj.jira_api.all_open_tickets, 
				cred_hash=self.cred_hash
			)			

			# make sure we have Jira tickets
			if not jira_tickets['status']:
				message = 'Could not get Jira tickets: '+jira_tickets['data']
				self.sql_object.log_error(message=message)
				return {'status': False, 'data': message}

			# print time to retrieve tickets
			logging.info('Processing '+str(len(jira_tickets['data']))+' Jira tickets')
			end_get = time.time()
			logging.info('Retrieved Tickets: {:.4}'.format(end_get-start_get))
			start_bot = time.time()

			# create thread for chatbot to check pings and print time to start thread
			for jira_ticket in jira_tickets['data']:	
				self.check_for_pings(jira_ticket=jira_ticket)
			end_bot = time.time()
			logging.info('Check for pings: {:.4}'.format(end_bot-start_bot))
			start_update = time.time()

			# for each jira ticket update DB table
			session = self.sql_object.login()
			for jira_ticket  in jira_tickets['data']:
				self.sql_object.update_ticket(jira_ticket=jira_ticket, session=session)
			self.sql_object.logout(session=session)

			# print time to update tickets in DB
			end_update = time.time()
			logging.info('Updated Tickets: {:.4}'.format(end_update-start_update))
			start_commit = time.time()

			# set all inactive tickets and print time it took
			session = self.sql_object.login()
			self.sql_object.set_inactive_tickets(jira_tickets=jira_tickets, session=session)
			self.sql_object.logout(session=session)
			end_inactive = time.time()
			logging.info('Set Inactive Tickets: {:.4}'.format(end_inactive-start_commit))		
			
			# if we want to add beta stuff and enough time has passed then show beta stats
			if self.is_beta_week and (self.beta_wait_time == self.beta_wait_count):
				start_beta = time.time()
				thr = threading.Thread(target=self.beta_week_stats)
				thr.start()
				end_beta = time.time()
				self.beta_wait_count = self.beta_wait_count + 1
				logging.info('Beta processing: {:.4}'.format(end_beta-start_beta))

			# print cron runtime 
			end_cron = time.time()
			logging.warning('CRON end time: {:.4}'.format(end_cron-start_get))

			return jira_tickets

		except Exception as err:
			# log error and stack trace
			message = sys.exc_info()[0]
			logging.exception(message)
			return {'status': False, 'data': str(err)}

	def beta_week_stats(self):
		'''gets beta week stats and pings them

		Args:
			None

		Returns:
			None
		'''
		filter_values = []
		
		# for each beta filter get total number of tickets
		for filter_name in self.filter_names:
			jira_tickets = self.jira_obj.get_jira_tickets(cred_hash=self.cred_hash, filter_number=self.filters[filter_name])
			filter_values.append( len(jira_tickets['data']) )

		# create kwargs for pinging beta stats and ping stats
		stat_results = dict(zip(filter_names, filter_values))
		self.chat_obj.beta_statistics(**stat_results)
		
		# reset beta stat counter
		self.beta_wait_count = 0
		
		

	def check_for_pings(self, jira_ticket):
		'''updates a Jira ticket in the DB and pings any new tickets if it meets the conditions:
			not assigned to a PM, user wants ticket, user hasn't been pinged ticket before

		Args:
			jira_ticket (dict) a formatted Jira ticket object

		Returns:
			None
		'''
		# log into SQL
		session = self.sql_object.login()
		# if user not pinged yet then try
		if( not self.sql_object.get_ping(field='new_ping', key=jira_ticket['key'], session=session) ):
			self.check_for_new_ping(jira_ticket=jira_ticket, session=session)
		else:
			# else check for any other pings based on component and status
			self.check_for_status_pings(jira_ticket=jira_ticket, session=session)
		# log out of SQL
		self.sql_object.logout(session=session)

	def check_for_new_ping(self, jira_ticket, session):
		'''checks Jira ticket for any new pings and update DB

		Args:
			jira_ticket (dict) a foramtted Jira ticket object
			session (Session instance) the session to close

		Returns:
			None
		'''
		# get ticket data
		username = jira_ticket['username']
		story_point = jira_ticket['story_point']
		key = jira_ticket['key']
		msrp = jira_ticket['msrp']
		key = jira_ticket['key']
		summary = jira_ticket['summary']

		# see if user wants ping
		wants_ping = self.sql_object.get_user_ping_value(username=username, field='new_ping', session=session)

		# if user wants ping then ping them
		if(wants_ping == 1):
			# get pcr estimate
			pcr_estimate = self.crucible_obj.get_pcr_estimate(story_point=story_point)
			# send new ticket ping to user and update ping
			self.sql_object.update_ping(key=key, field='new_ping', value=1, session=session)
			thr = threading.Thread(
				target=self.chat_obj.send_new_ticket, 
				kwargs={
				'key':key, 
				'msrp':msrp, 
				'summary':summary, 
				'story_point':story_point, 
				'pcr_estimate':pcr_estimate, 
				'username': username
			})
			thr.start()
			# send me new ticket if it's not my ticket
			# even if ive already been pinged (like for pm ticket)
			if(username != self.username):
				thr = threading.Thread(
					target=self.chat_obj.send_me_ticket_info, 
					kwargs={'key':key, 'summary':summary, 'username':username, 'ping_message':'New Ticket'}
				)
				thr.start()

		# else if project manager then ping me if not my ticket 
		# but do not update ping user and update my ping so I don't get it again
		elif(wants_ping == 2):
			self.sql_object.update_ping(key=key, field='me_ping', value=1, session=session)
			if(username != self.username and not self.sql_object.get_ping(key=key, field='me_ping', session=session)):
				# then ping me that a new user has been assigned
				thr = threading.Thread(
					target=self.chat_obj.send_me_ticket_info, 
					kwargs={'key':key, 'summary':summary, 'username':username, 'ping_message':'New Ticket'}
				)
				thr.start()
			

		# else user doesn't want ping so update new ping and send me ticket
		else:
			self.sql_object.update_ping(key=key, field='new_ping', value=1, session=session)
			if(username != self.username):
				thr = threading.Thread(
					target=self.chat_obj.send_me_ticket_info, 
					kwargs={'key':key, 'summary':summary, 'username':username, 'ping_message':'New Ticket'}
				)
				thr.start()


	def check_for_status_pings(self, jira_ticket, session):
		'''checks Jira ticket component/status for pings needed

		Args:
			jira_ticket (dict) a formatted Jira ticket object
			session (Session instance) the session to close

		Returns:
			None
		'''
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
		crucible_id = jira_ticket['crucible_id']

		# get jira ticket's ping settings
		pings = self.sql_object.get_pings(key=key, session=session)

		# safety check - make sure we have data before continuing
		if not pings:
			return False
		
		# if pcr needed and has not been pinged - update db and send ping
		if("PCR - Needed" in component and not pings.pcr_ping):
			# get PCR estimate
			pcr_estimate = self.crucible_obj.get_pcr_estimate(story_point=story_point)
			# send ping
			thr = threading.Thread(
				target=self.chat_obj.send_pcr_needed, 
				kwargs={
				'key':key, 
				'msrp':msrp, 
				'sprint':sprint, 
				'label':label, 
				'crucible_id':crucible_id, 
				'pcr_estimate':pcr_estimate
			})
			thr.start()
			# reset ping settings if needed
			self.sql_object.reset_pings(ping_type='pcr_ping', key=key, session=session)
			# update ping
			self.sql_object.update_ping(key=key, field='pcr_ping', value=1, session=session)

		# if qa needed and has not been pinged - update db and send ping
		elif("Ready for QA" in status and not pings.qa_ping):
			thr = threading.Thread(
				target=self.chat_obj.send_qa_needed, 
				kwargs={'key':key, 'msrp':msrp, 'sprint':sprint, 'label':label, 'crucible_id':crucible_id}
			)
			thr.start()
			# reset ping settings if needed
			self.sql_object.reset_pings(ping_type='qa_ping', key=key, session=session)
			# update ping
			self.sql_object.update_ping(key=key, field='qa_ping', value=1, session=session)
		
		# if merge needed and has not been pinged - update db and send ping
		elif("Merge Code" in component and not pings.merge_ping):
			self.ping_jira_status(msrp=msrp, ping_type='merge_ping', username=username, key=key, summary=summary, ping_message='Merge Code', sprint=sprint)
			
		# if merge conflict and has not been pinged - update db and send ping
		elif("Merge Conflict" in component and not pings.conflict_ping):
			self.ping_jira_status(msrp=msrp, ping_type='conflict_ping', username=username, key=key, summary=summary, ping_message='Merge Conflict')
		
		# if uct fail and has not been pinged - update db and send ping	
		elif("UCT - Failed" in component and not pings.uct_fail_ping):
			self.ping_jira_status(msrp=msrp, ping_type='uct_fail_ping', username=username, key=key, summary=summary, ping_message='UCT - Failed')
		
		# if cr fail and has not been pinged - update db and send ping
		elif("Code Review - Failed" in component and not pings.cr_fail_ping):
			self.ping_jira_status(msrp=msrp, ping_type='cr_fail_ping', username=username, key=key, summary=summary, ping_message='Code Review - Failed')
		
		# if ready in uct, has no merge code component, ticket has already been pinged for merge code and hasnt been pinged for code merged then ping
		elif("Ready for UCT" in status and "Merge Code" not in component and pings.merge_ping and not pings.uct_ping):
			# notify of repo update
			# repos_merged = self.crucible_obj.get_repos_of_review(crucible_id=crucible_id, cred_hash=self.cred_hash)
			# if repos_merged['status']:
			# 	self.chat_obj.send_merge_alert(
			# 	key=key, msrp=msrp, sprint=sprint, 
			# 	username=username, repos_merged=repos_merged['data'], 
			# 	crucible_id=crucible_id, summary=summary
			# )
			# else:
			# 	self.sql_object.log_error(message='Could not retrieve repos for repo update ping: '+repos_merged['data'], session=session)
			# update DB
			self.sql_object.update_ping(key=key, field='uct_ping', value=1, session=session)

		# if in dev and already uct pinged then it's a uct fail
		elif( "In Development" in status and pings.uct_ping):
			self.ping_jira_status(msrp=msrp, ping_type='uct_fail_ping', username=username, key=key, summary=summary, ping_message='UCT - Failed')

		# if in dev but QA pinged then then it's a QA fail
		elif( "In Development" in status and pings.qa_ping):
			self.ping_jira_status(msrp=msrp, ping_type='qa_fail_ping', username=username, key=key, summary=summary, ping_message='QA - Failed')


	def ping_jira_status(self, msrp, ping_type, username, key, summary, ping_message, sprint=''):
		'''pings a Jira ticket status to a user if they are setup to get pings

		Args:
			msrp (str) the MSRP of the Jira ticket
			ping_type (str) the ping type in DB table from (qa_ping, new_ping, etc)
			username (str)  the username of the user who is getting pinged
			key (str)  the key of the Jira ticket
			summary (str)  the sumary of the Jira ticket
			ping_message (str) the type of ping (New Ticket, QA Fail, etc)
			sprint (str)  the sprint of the Jira ticket

		Returns:
			None
		'''		
		# see if user wants ping
		session = self.sql_object.login()
		wants_ping = self.sql_object.get_user_ping_value(username=username, field=ping_type, session=session)
		
		# if user wants ping then ping them
		if(wants_ping == 1):
			thr = threading.Thread(
				target=self.chat_obj.send_jira_update, 
				kwargs={'key':key, 'msrp':msrp, 'summary':summary, 'username':username, 'ping_message':ping_message, 'sprint':sprint}
			)
			thr.start()
		
		# send me Merge Conflict
		if(username != self.username):
			thr = threading.Thread(
				target=self.chat_obj.send_me_ticket_info, 
				kwargs={'key':key, 'summary':summary, 'username':username, 'ping_message':ping_message}
			)
			thr.start()

		# reset pings
		self.sql_object.reset_pings(ping_type=ping_type, key=key, session=session)

		# update ping
		self.sql_object.update_ping(key=key, field=ping_type, value=1, session=session)

		# logout of session
		self.sql_object.logout(session=session)