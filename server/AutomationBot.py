#!/usr/bin/python3

import os
import datetime
import base64
import logging

import sys
sys.path.append('Common')
sys.path.append('Crucible')
sys.path.append('Jira')

import Jira
import Crucible
import DevCenterSQL
import Qbot



class AutomationBot(object):
	'''Handles Scraping data from Jira and Crucible to Store in DB and handle any ping notifications'''

	def __init__(self, is_beta_week, is_qa_pcr, beta_stat_ping_now, debug, merge_alerts):
		'''

		Args:
			is_beta_week (boolean) 
			is_qa_pcr (boolean) 
			beta_stat_ping_now (boolean) 
			debug (boolean) 
			merge_alerts (boolean) 

		Returns:

		'''
		self.username = os.environ['USER']
		self.password = os.environ['PASSWORD']
		self.jira_url= os.environ['JIRA_URL']
		self.filters = {'my_filter':"11502", 'beta':'11004', 'qa':'11019', 'cr':'11007', 'uct':'11014', 'all':'11002', 'pcr':'11128'}
		self.bot_name = os.environ['BOT_NAME']
		self.bot_password = os.environ['BOT_PASSWORD']
		self.debug = debug
		################################################################################
		# create DB object and connect
		self.sql_object = DevCenterSQL.DevCenterSQL()
		self.sql_object.login()
		################################################################################
		# create objects
		self.jira_obj = Jira.Jira()
		self.crucible_obj = Crucible.Crucible()
		self.qbot_obj = Qbot.Qbot(debug=debug, is_qa_pcr=is_qa_pcr, merge_alerts=merge_alerts)
		################################################################################
		self.add_beta_message = True
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
		'''

		Args:
			None
		Returns:

		'''

		try:
			# get all open Jira tickets
			jira_tickets = self.jira_obj.get_jira_tickets(filter_number=self.filters['all'], cred_hash=self.cred_hash)

			# make sure we have Jira tickets
			if not jira_tickets['status']:
				self.sql_object.log_error(message='Could not get Jira tickets: '+jira_tickets['data'])
				return

			# print number of tickets retrieved
			print( jira_tickets['total_tickets'], 'Jira tickets retrieved.' )

			# for each jira ticket update DB table and make any pings
			for jira_ticket  in jira_tickets['data']:
				self.sql_object.update_ticket(jira_ticket=jira_ticket)
				self.check_for_pings(jira_ticket=jira_ticket)

			# if we want to add beta stuff
			if(self.is_beta_week):
				self.beta_week_stats()

		except:
			# log error and stack trace
			message = sys.exc_info()[0]
			logging.exception(message)

			# if debug mode then just die else log error and continue
			if self.debug:
				exit(1)
			else:
				self.sql_object.log_error(message=message)
				return

	def beta_week_stats(self):
		'''gets beta week stats and pings them

		Args:
			None

		Returns:

		'''
		# if enough time has passed then show beta stats if we want to
		if ( (self.beta_wait_time == self.beta_wait_count) and self.add_beta_message ):
			
			# clear beta stats array and list filters to get
			filter_values = []
			filter_names = ['uct', 'qa', 'cr', 'uct', 'beta', 'pcr']
			
			# for each beta filter get total number of tickets
			for filter_name in filter_names:
				jira_tickets = self.jira_obj.get_jira_tickets(self.filters[filter_name])
				filter_values.append( jira_tickets['total_tickets'] )

			# create kwargs for pinging beta stats and ping stats
			stat_results = dict(zip(filter_names, filter_values))
			self.qbot_obj.beta_statistics(**stat_results)
			
			# reset beta stat counter
			self.beta_wait_count = 0
		
		# increment beta message counter
		self.beta_wait_count = self.beta_wait_count + 1

	def check_for_pings(self, jira_ticket):
		'''updates a Jira ticket in the DB and pings any new tickets if it meets the conditions:
			not assigned to a PM, user wants ticket, user hasn't been pinged ticket before

		Args:
			jira_ticket (dict) a formatted Jira ticket object

		Returns:
			None
		'''
		# if user not pinged yet then try
		if( not self.sql_object.get_ping(field='new_ping', key=jira_ticket['key']) ):
			self.check_for_new_ping(jira_ticket=jira_ticket)

		# check for any other pings based on component and status
		self.check_for_status_pings(jira_ticket=jira_ticket)

	def check_for_new_ping(self, jira_ticket):
		'''checks Jira ticket for any new pings and update DB

		Args:
			jira_ticket (dict) a foramtted Jira ticket object

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
		wants_ping = self.sql_object.get_user_ping_value(username=username, field='new_ping')

		# if user wants ping then ping them
		if(wants_ping == 1):
			# get pcr estimate
			pcr_estimate = self.crucible_obj.get_pcr_estimate(story_point=story_point)
			# send new ticket ping to userogout
			self.qbot_obj.send_new_ticket(key=key, msrp=msrp, summary=summary, username=username, story_point=story_point, pcr_estimate=pcr_estimate)
			# send me new ticket if it's not my ticket
			if(username != self.username):
				self.qbot_obj.send_me_ticket_info(key=key, summary=summary, username=username, ping_message='New Ticket')
			# update ping for user
			self.sql_object.update_ping(key=key, field='new_ping', value=1)

		# else if project manager then ping me if not my ticket but do not update ping user
		# and update my ping so I don't get it again
		elif(wants_ping == 2):
			if(username != self.username and not self.sql_object.get_ping(key=key, field='me_ping')):
				# then ping me that a new user has been assigned
				self.qbot_obj.send_me_ticket_info(key=key, summary=summary, username=username, ping_message='New Ticket')
			self.sql_object.update_ping(key=key, field='me_ping', value=1)

		# else user doesn't want ping so update me ping and send me ticket
		else:
			if(username != self.username):
				self.qbot_obj.send_me_ticket_info(key=key, summary=summary, username=username, ping_message='New Ticket')
			self.sql_object.update_ping(key=key, field='new_ping', value=1)


	def check_for_status_pings(self, jira_ticket):
		'''checks Jira ticket component/status for pings needed

		Args:
			jira_ticket (dict) a formatted Jira ticket object

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

		# get jira ticket's ping settings
		pings = self.sql_object.get_pings(key=key)

		if not pings:
			return False
		
		# if pcr needed and has not been pinged - update db and send ping
		if("PCR - Needed" in component and not pings.pcr_ping):

			# get PCR number and check if we have it
			crucible_id = self.crucible_obj.get_review_id(key=key, msrp=msrp, cred_hash=self.cred_hash)
			if not crucible_id['status']:
				self.sql_object.log_error(message='Could not get Crucible review ID for: '+crucible_id['data']+f' with status {status} and component {component}')
				return

			# get PCR estimate
			pcr_estimate = self.crucible_obj.get_pcr_estimate(story_point=story_point)
			# send ping
			self.qbot_obj.send_pcr_needed(key=key, msrp=msrp, sprint=sprint, label=label, crucible_id=crucible_id['data'], pcr_estimate=pcr_estimate)
			# reset ping settings if needed
			self.sql_object.reset_pings(ping_type='pcr_ping', key=key)
			# update ping
			self.sql_object.update_ping(key=key, field='pcr_ping', value=1)

		# if qa needed and has not been pinged - update db and send ping
		elif("Ready for QA" in status and not pings.qa_ping):

			# get Crucible ID and check if we have it
			crucible_id = self.crucible_obj.get_review_id(key=key, msrp=msrp, cred_hash=self.cred_hash)
			if not crucible_id['status']:
				self.sql_object.log_error(message='Could not get Crucible review ID for: '+crucible_id['data']+f' with status {status} and component {component}')
				return

			# add crucible link to DB
			self.sql_object.add_crucible(key=key, crucible_id=crucible_id['data'])

			self.qbot_obj.send_qa_needed(key=key, msrp=msrp, sprint=sprint, label=label, crucible_id=crucible_id['data'])
			# reset ping settings if needed
			self.sql_object.reset_pings(ping_type='qa_ping', key=key)
			# update ping
			self.sql_object.update_ping(key=key, field='qa_ping', value=1)
		
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
			# get Crucible ID and check if we have it
			crucible_id = self.crucible_obj.get_review_id(key=key, msrp=msrp, cred_hash=self.cred_hash)
			if not crucible_id['status']:
				self.sql_object.log_error(message='Could not get Crucible review ID for: '+crucible_id['data']+f' with status {status} and component {component}')
				return

			# notify of repo update
			repos_merged = self.crucible_obj.get_repos_of_review(crucible_id=crucible_id, cred_hash=self.cred_hash)
			if repos_merged['status']:
				self.qbot_obj.send_merge_alert(key=key, msrp=msrp, sprint=sprint, username=username, repos_merged=repos_merged['data'], crucible_id=crucible_id, summary=summary)
			else:
				self.sql_object.log_error(message='Could not retrieve repos for repo update ping: '+repos_merged['data'])
				
			# update DB
			self.sql_object.update_ping(key=key, field='uct_ping', value=1)

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
		wants_ping = self.sql_object.get_user_ping_value(username=username, field=ping_type)
		# if user wants ping then ping them
		if(wants_ping == 1):
			self.qbot_obj.send_jira_update(key=key, msrp=msrp, summary=summary, username=username, ping_message=ping_message, sprint=sprint)
		# send me Merge Conflict
		if(username != self.username):
			self.qbot_obj.send_me_ticket_info(key=key, summary=summary, username=username, ping_message=ping_message)
		# reset pings
		self.sql_object.reset_pings(ping_type=ping_type, key=key)
		# update ping
		self.sql_object.update_ping(key=key, field=ping_type, value=1)