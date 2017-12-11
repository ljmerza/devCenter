#!/usr/bin/python3

import requests
import time
import re
from bs4 import BeautifulSoup
import math

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

class Jira(object):
	'''iTrack class using an username and password'''

	def __init__(self, rsa_key_path, username, password, base_url):
		'''setup user's credentials and paths, rsa file path, username, and password'''

		##############################################################################
		self.base_url = base_url # the base url to browse a single ticket
		self.login_url = f'{self.base_url}/login.jsp' # the login page
		self.ticket_base = f'{self.base_url}/browse' # the login page
		self.jira_filter_base_url = f'{self.base_url}/issues/?filter=' # the base url to look at a ticket list
		# each ticket list only shows 50 tickets at a time. The startIndex parameter shows what group of 50 tickets to start with
		self.indexes = ['', '&startIndex=50', '&startIndex=100', '&startIndex=150', '&startIndex200', '&startIndex250', '&startIndex300']
		##############################################################################
		self.rss_feed_base_url = f'{self.base_url}/activity?'
		self.rss_param_results = 20
		self.rss_param_providers = ''
		self.rss_param_auth = 'basic'
		self.rss_feed_url = f'{self.rss_feed_base_url}maxResults={self.rss_param_results}&providers={self.rss_param_providers}&os_authType={self.rss_param_auth}'
		##############################################################################
		self.dividers = 202 # how long are the dividers in the ascii table
		self.rss_dividers = 150 # how long are the dividers in the rss ascii table
		self.print_total = False # print total tickets in ascii table
		self.sleep_time = 60 *1 # check on jira every 1 min
		self.total_tickets = 0
		##############################################################################
		self.rsa_key_path = rsa_key_path
		self.payload = { # jira body payload
			"os_username": username,
			"os_password": password,
			"login": "Log+In",
			"os_destination" : "",
			"user_role": "",
			"atl_token": ""
		}
		##############################################################################
		self.key_results = []
		self.msrp_results = []
		self.status_results = []
		self.component_results = []
		self.summary_results = []
		self.estimate_results = []
		self.username_results = []

		self.rss_feed_actions = []
		self.rss_feed_users = []
		self.rss_feed_titles = []
		self.rss_feed_links = []
		##############################################################################


	def login(self):
		'''create a session and logs into jira'''
		self.session_obj = requests.Session()
		self.session_obj.post(self.login_url, data=self.payload)

	def get_jira_rss_data(self):
		'''gets rss feed from jira'''
		session_data = self.session_obj.get( self.rss_feed_url )
		# end session after data comes back
		s.config['keep_alive'] = False

		# reset rss feed data
		self.rss_feed_actions = []
		self.rss_feed_users = []
		self.rss_feed_titles = []
		self.rss_feed_links = []

		# parse html
		soup_data = BeautifulSoup(session_data.text, 'lxml')
		# get all activity actions and authors
		feed_titles = soup_data.find_all('title')

		# for each icloud ticket
		for title in feed_titles:
			#  get the need elements
			action = findAll.find('span')
			user = findAll.find(attrs={'class':"activity-item-user"})
			title = findAll.find('title')
			link = findAll.find('a')
			# save the needed data
			
			self.rss_feed_actions.append(action.text)
			self.rss_feed_users.append(user.text)
			self.rss_feed_titles.append(title.text)
			self.rss_feed_links.append(link['href'])

	# def get_jira_rss_data(self):
	# 	'''returns jira rss data retrieved'''
	# 	return self.rss_feed_actions, self.rss_feed_users, self.rss_feed_titles, self.rss_feed_links
	
	def show_jira_rss_ascii(self):
		'''print ascii of jira rss data to console'''

		# {0:15.15} = use variable 0 ('Key') with 15 preallocated spaces, .15 means slice string after 15 characters
		print('', '-'* self.rss_dividers)
		print(" | {0:20.20} | {1:20.20} | {2:25.25} | {3:30.30} |".format('User', 'Action', 'Title', 'URL'))
		print('', '-'* self.rss_dividers)

		# print table data
		for i in range(len(self.rss_feed_users)):
			print(" | {0:20.20} | {1:20.20} | {2:25.25} | {3:30.30} |".format(self.rss_feed_users[i], self.rss_feed_actions[i], self.rss_feed_titles[i], self.rss_feed_links[i]))
		print('','-'* self.rss_dividers)

	def get_jira_filter_list(self, filter_id):
		'''gets iTrack ticket data from a filter_id'''

		# reset instance jira values
		self.key_results = []
		self.msrp_results = []
		self.status_results = []
		self.component_results = []
		self.summary_results = []
		self.estimate_results = []
		self.username_results = []

		# go through each ticket page in jira
		for param in self.indexes:

			# reset current jira data
			keys = []
			msrps = []
			statuses = []
			components = []
			summaries = []
			estimates = []
			usernames = []

			# get html
			session_data = self.session_obj.get( self.jira_filter_base_url+str(filter_id) + str(param) )

			# build the DOM Tree
			soup_data = BeautifulSoup(session_data.text, 'lxml')

			# extract keys data from html
			parser_results = soup_data.find_all(attrs={'class':"issuekey"})
			for td in parser_results:
				el = td.findAll('a')
				for a in el:
					if(a.text):
						keys.append(a.text)

			# extract msrp data from html
			parser_results = soup_data.find_all(attrs={'class':"customfield_10212"})
			for td in parser_results:
				msrps.append(td.text.strip())
			
			# extract status data from html
			parser_results = soup_data.find_all(attrs={'class':"status"})
			for td in parser_results:
				el = td.findAll('span')
				for a in el:
					statuses.append(a.text)

			# extract username data from html
			parser_results = soup_data.find_all(attrs={'class':"assignee"})
			for td in parser_results:
				el = td.findAll('span')
				for a in el:
					# parse out the username
					text = a.text
					text_index = text.index('(')+1
					text = text[text_index:text_index+6]
					# add username to array
					usernames.append(text)

			# extract components data from html
			parser_results = soup_data.find_all(attrs={'class':"components"})
			for td in parser_results:
				el = td.findAll('a')
				if not el:
					el = 'None'
					components.append(el)
				else:
					el = [x.text for x in el]
					components.append(' '.join(el))

			# extract summary data from html
			parser_results = soup_data.find_all(attrs={'class':"summary"})
			for td in parser_results:
				el = td.find('a')
				summaries.append(el.text)
			
			# extract estimate data from html
			parser_results = soup_data.find_all(attrs={'class':"timeoriginalestimate"})
			for td in parser_results:
				estimates.append(td.text)

			# save new results to overall results
			self.key_results = self.key_results + keys
			self.msrp_results = self.msrp_results + msrps
			self.status_results = self.status_results + statuses
			self.component_results = self.component_results + components
			self.summary_results = self.summary_results + summaries
			self.estimate_results = self.estimate_results + estimates
			self.username_results = self.username_results + usernames
		
			# jira shows 50 tickets at a time so if less than 50 are showing then we
			# are at the end of list so print results and end loop
			if( len(keys) < 50 ):
				self.total_tickets = len(self.key_results)
				break
	

	def show_jira_ascii(self, print_total):
		'''print ascii of jira data to console, boolean to print total at bottom or not'''

		# {0:15.15} = use variable 0 ('Key') with 15 preallocated spaces, .15 means slice string after 15 characters
		print('', '-'* self.dividers)
		print(" | {0:10.10} | {1:7.7} | {2:25.25} | {3:30.30} | {4:65.65} | {5:46} |".format('Key', 'MSRP', 'Status', 'Component', 'Summary', 'URL'))
		print('', '-'* self.dividers)

		# print table data
		for i in range(len(self.key_results)):
			print(" | {0:10.10} | {1:7.7} | {2:25.25} | {3:30.30} | {4:65.65} | {5}/{6:12} |".format(self.key_results[i], self.msrp_results[i], self.status_results[i], self.component_results[i], self.summary_results[i], self.ticket_base, self.key_results[i]))
		print('','-'* self.dividers)

		if (print_total):
			# print table totals
			print(" | TOTAL: {}".format( self.total_tickets ))
			print('','-'* self.dividers)
		print('\n')

	def show_jira_ascii_beta(self, print_total):
		'''print ascii of jira data to console, boolean to print total at bottom or not'''

		# {0:15.15} = use variable 0 ('Key') with 15 preallocated spaces, .15 means slice string after 15 characters
		print('', '-'* self.dividers)
		print(" | {0:7.7} | {1:25.25} | {2:30.30} | {3:65.65} | {4:46} |".format('MSRP', 'Status', 'Component', 'Summary', 'URL'))
		print('', '-'* self.dividers)

		for i in range(len(self.key_results)):
			print(" | {0:7.7} | {1:25.25} | {2:30.30} | {3:65.65} | {4}/{5:12} |".format(self.msrp_results[i], self.status_results[i], self.component_results[i], self.summary_results[i], self.ticket_base, self.key_results[i]))
		print('','-'* self.dividers)

		if (print_total):
			# print table totals
			print(" | TOTAL: {}".format( self.total_tickets ))
			print('','-'* self.dividers)
		print('\n')	

	def return_jira_data(self):
		'''return all jira data'''
		return self.username_results, self.key_results, self.msrp_results, self.status_results, self.component_results, self.summary_results, self.estimate_results