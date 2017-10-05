#!/usr/bin/python3

import Jira
import sql
import qBot
import crucible
import apexReminders
import os
import datetime


class AutomationBot(object):

	def __init__(self, is_beta_week, is_qa_pcr, want_time_reminders, beta_stat_ping_now, debug, show_ascii, merge_alerts):
		self.attuid = os.environ['USER']
		self.password = os.environ['PASSWORD']
		self.base_url= os.environ['JIRA_URL']
		self.filters = {'my_filter':"11502", 'beta':'11004', 'qa':'11019', 'cr':'11007', 'uct':'11014', 'all':'11002', 'pcr':'11128'}
		self.bot_name = os.environ['BOT_NAME']
		self.bot_password = os.environ['BOT_PASSWORD']
		################################################################################
		self.show_ascii = show_ascii
		self.merge_alerts = merge_alerts
		self.debug = debug
		################################################################################
		# create objects
		self.sql_obj = sql.MySQL()
		self.jira_obj = Jira.Jira()
		self.crucible_obj = crucible.Crucible()
		self.qbot_obj = qBot.Qbot(ticket_base=self.jira_obj.get_ticket_base(), debug=debug, is_qa_pcr=is_qa_pcr, merge_alerts=merge_alerts)
		self.reminder_obj = apexReminders.ApexReminders(qbot_obj=self.qbot_obj)
		################################################################################
		# create connections
		self.sql_obj.login()
		response = self.crucible_obj.login()
		if not response['status']:
			print('Could not log into Crucible', datetime.datetime.now())
			exit(0)
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
		self.is_qa_pcr = is_qa_pcr
		self.want_time_reminders = want_time_reminders

	def update_jira(self):
		# remind time sheets and time logging
		if self.want_time_reminders:
			self.reminder_obj.calc_messages()

		# create jira connection
		response = self.jira_obj.login()
		if not response['status']:
			print('Could not log into Jira', datetime.datetime.now())
			exit(0)

		# get jira filter details
		self.jira_obj.get_jira_data(filter_number=self.filters['all'])
		# sort all data
		self.jira_obj.sort_data_by('attuid')

		# get jira data
		jira_data = self.jira_obj.return_jira_data()
		attuids = jira_data['attuids']
		keys = jira_data['keys']
		msrps = jira_data['msrps']
		statuses = jira_data['statuses']
		components = jira_data['components']
		summaries = jira_data['summaries']
		story_points = jira_data['story_points']
		sprints = jira_data['sprints']
		labels = jira_data['labels']

		# try to create workbook
		# self.jira_obj.create_work_book()
		
		if self.show_ascii:
			# show ascii table
			self.jira_obj.show_jira_ascii()

		# for each jira ticket update db table and make any pings
		for index, key in enumerate(keys):
			self._update_jira_ticket(key=key, msrp=msrps[index], summary=summaries[index], attuid=attuids[index], story_point=story_points[index])	

			# check for any pings to be made
			self._jira_component_check(status=statuses[index],component=components[index], msrp=msrps[index], story_point=story_points[index], key=key, summary=summaries[index], attuid=attuids[index], sprint=sprints[index], labels=labels[index])

		# if we want to add beta stuff
		if(self.is_beta_week):
			self.beta_week_stats()

	def beta_week_stats(self):
		# if enough time has passed then show beta stats if we want to
		if ( (self.beta_wait_time == self.beta_wait_count) and self.add_beta_message ):
			
			# clear beta stats array and list filters to get
			filter_values = []
			filter_names = ['uct', 'qa', 'cr', 'uct', 'beta', 'pcr']
			
			# for each beta filter get data and save it
			for filter_name in filter_names:
				# get filter data
				self.jira_obj.get_jira_data(self.filters[filter_name])
				# get beta filter ticket total and add to array
				filter_values.append( self.jira_obj.get_total_tickets() )
			
			# create kwargs
			stat_results = dict(zip(filter_names, filter_values))
			# create beta stats message and send it
			self.qbot_obj.beta_statistics(**stat_results)
			
			# reset beta stat counter
			self.beta_wait_count = 0
		
		# increment beta message counter
		self.beta_wait_count = self.beta_wait_count + 1
		print('beta_wait_count', self.beta_wait_count)

	def _update_jira_ticket(self, key, msrp, summary, attuid, story_point):
		# update ticket in db
		self.sql_obj.update_ticket(key=key, attuid=attuid, msrp=msrp)

		# if user not pinged yet then try
		if( not self.sql_obj.get_ping(field='new_ping', key=key) ):

			# see if user wants ping
			wants_ping = self.sql_obj.get_user_settings(attuid=attuid, field='new_ping')

			# if user wants ping then ping them
			if(wants_ping == 1):
				# get pcr estimate
				pcr_estimate = self.crucible_obj.get_pcr_estimate(story_point=story_point)
				# send new ticket ping
				self.qbot_obj.send_new_ticket(key=key, msrp=msrp, summary=summary, attuid=attuid, story_point=story_point, pcr_estimate=pcr_estimate)
				# send me new ticket
				if(attuid != self.attuid):
					self.qbot_obj.send_me_ticket_info(key=key, summary=summary, attuid=attuid, ping_message='New Ticket')
				# update ping
				self.sql_obj.update_ping(key=key, field='new_ping', value=1)

			# else if project manager then ping me if not my ticket but do not update ping user
			elif(wants_ping == 2):
				if(attuid != self.attuid and not self.sql_obj.get_ping(key=key, field='me_ping')):
					# then ping me that a new user has been assigned
					self.qbot_obj.send_me_ticket_info(key=key, summary=summary, attuid=attuid, ping_message='New Ticket')
				self.sql_obj.update_ping(key=key, field='me_ping', value=1)
			# else user doesn't want ping so update me ping and send me ticket
			else:	
				if(attuid != self.attuid):
					self.qbot_obj.send_me_ticket_info(key=key, summary=summary, attuid=attuid, ping_message='New Ticket')
				self.sql_obj.update_ping(key=key, field='new_ping', value=1)


	def _jira_component_check(self, component, msrp, story_point, key, summary, attuid, status, sprint, labels):
		'''checks jira ticket components for pings needed'''

		# get jira ticket's ping settings
		pings = self.sql_obj.get_pings(key=key)

		if not pings:
			return False
		
		# if pcr needed and has not been pinged - update db and send ping
		if( "PCR - Needed" in component and not pings['pcr_ping'] ):
			# get PCR number
			crucible_key, crucible_link = self.crucible_obj.get_review_id(key=key, msrp=msrp)
			# get pcr estimate
			pcr_estimate = self.crucible_obj.get_pcr_estimate(story_point)
			# send ping
			self.qbot_obj.send_pcr_needed(key=key, msrp=msrp, sprint=sprint, labels=labels, crucible_link=crucible_link, pcr_estimate=pcr_estimate)
			# reset ping settings if needed
			self.sql_obj.reset_pings(ping_type='pcr_ping', key=key)
			# update ping
			self.sql_obj.update_ping(key=key, field='pcr_ping', value=1)

		# if qa needed and has not been pinged - update db and send ping
		elif( "Ready for QA" in status and not pings['qa_ping'] ):
			# get crucible key for db
			crucible_key, crucible_link = self.crucible_obj.get_review_id(key=key, msrp=msrp)
			if crucible_key:
				# add crucible link to db
				self.sql_obj.add_crucible(key=key, crucible_link=crucible_key)
			self.qbot_obj.send_qa_needed(key=key, msrp=msrp, sprint=sprint, labels=labels, crucible_link=crucible_link)
			# reset ping settings if needed
			self.sql_obj.reset_pings(ping_type='qa_ping', key=key)
			# update ping
			self.sql_obj.update_ping(key=key, field='qa_ping', value=1)
		
		# if merge needed and has not been pinged - update db and send ping
		elif( "Merge Code" in component and not pings['merge_ping'] ):
			self._ping_jira_status(msrp=msrp, ping_type='merge_ping', attuid=attuid, key=key, summary=summary, ping_message='Merge Code', sprint=sprint)
			
		# if merge conflict and has not been pinged - update db and send ping
		elif( "Merge Conflict" in component and not pings['conflict_ping'] ):
			self._ping_jira_status(msrp=msrp, ping_type='conflict_ping', attuid=attuid, key=key, summary=summary, ping_message='Merge Conflict')
		
		# if uct fail and has not been pinged - update db and send ping	
		elif( "UCT - Failed" in component and not pings['uct_fail_ping'] ):
			self._ping_jira_status(msrp=msrp, ping_type='uct_fail_ping', attuid=attuid, key=key, summary=summary, ping_message='UCT - Failed')
		
		# if cr fail and has not been pinged - update db and send ping
		elif( "Code Review - Failed" in component and not pings['cr_fail_ping'] ):
			self._ping_jira_status(msrp=msrp, ping_type='cr_fail_ping', attuid=attuid, key=key, summary=summary, ping_message='Code Review - Failed')
		
		# if ready in uct, has no merge code component, ticket has already been pinged for merge code and hasnt been pinged for code merged then ping
		elif( "Ready for UCT" in status and "Merge Code" not in component and pings['merge_ping'] and not pings['uct_ping'] ):
			# send chat room ping of file changes
			self.crucible_obj.login()
			crucible_key, crucible_link = self.crucible_obj.get_review_id(key=key, msrp=msrp)
			if crucible_key:
				repos_merged = self.crucible_obj.get_repos_of_review(crucible_key=crucible_key)
				if repos_merged:
					self.qbot_obj.send_merge_alert(key=key, msrp=msrp, sprint=sprint, attuid=attuid, repos_merged=repos_merged, crucible_link=crucible_link, summary=summary)
			# update db
			self.sql_obj.update_ping(key=key, field='uct_ping', value=1)

		# if in dev and already uct pinged then it's a uct fail
		elif( "In Development" in status and pings['uct_ping']):
			self._ping_jira_status(msrp=msrp, ping_type='uct_fail_ping', attuid=attuid, key=key, summary=summary, ping_message='UCT - Failed')

		# if in dev but QA pinged then then it's a QA fail
		elif( "In Development" in status and pings['qa_ping']):
			self._ping_jira_status(msrp=msrp, ping_type='qa_fail_ping', attuid=attuid, key=key, summary=summary, ping_message='QA - Failed')


	def _ping_jira_status(self, msrp, ping_type, attuid, key, summary, ping_message, sprint=''):
		'''pings a jira ticket status'''
		
		# see if user wants ping
		wants_ping = self.sql_obj.get_user_settings(attuid=attuid, field=ping_type)
		# if user wants ping then ping them
		if(wants_ping):
			self.qbot_obj.send_jira_update(key=key, msrp=msrp, summary=summary, attuid=attuid, ping_message=ping_message, sprint=sprint)
		# send me Merge Conflict
		if(attuid != self.attuid):
			self.qbot_obj.send_me_ticket_info(key=key, summary=summary, attuid=attuid, ping_message=ping_message)
		# reset pings
		self.sql_obj.reset_pings(ping_type=ping_type, key=key)
		# update ping
		self.sql_obj.update_ping(key=key, field=ping_type, value=1)

	

