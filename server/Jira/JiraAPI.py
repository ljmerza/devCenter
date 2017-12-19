#!/usr/bin/python3

import os
import re
from Common.DevCenterAPI import DevCenterAPI

class JiraAPI(DevCenterAPI):
	'''used as an adapter for Jira API requests'''

	def __init__(self):
		'''creates a JiraAPI interface
		and sets all Jira API endpoints

		Args:
			None

		Returns:
			An instance of JiraAPI
		'''
		DevCenterAPI.__init__(self)
		self.jira_url = os.environ['JIRA_URL']
		self.jira_ticket = f'{self.jira_url}/browse'
		self.crucible_url = os.environ['CRUCIBLE_URL']
		self.crcible_review = f'{self.crucible_url}/cru/'
		self.api_base = f'{self.jira_url}/rest/api/2'
		self.all_open_tickets = 'project%20in%20(AQE%2C%20"Auto%20QM"%2C%20"Customer%20DB"%2C%20"Manager%20DB"%2C%20"Taskmaster%20Dashboard"%2C%20TeamDB%2C%20TQI%2C%20"Unified%20Desktop"%2C%20UPM%2C%20WAM%2C%20SASHA)%20AND%20status%20in%20("IN%20DEVELOPMENT"%2C%20"IN%20SPRINT"%2C%20"Ready%20for%20Release"%2C%20"Code%20Review"%2C%20"Ready%20For%20QA"%2C%20"IN%20QA"%2C%20"READY%20FOR%20UCT")%20OR%20assignee%20in%20(ep759g%2C%20wc591w)'
		self.jira_search_url = f'{self.jira_url}/rest/api/2/search'
		self.fields = 'customfield_10109,comment,status,customfield_10212,summary,assignee,components,customfield_10006,customfield_10001,customfield_10002,label,fixVersions,duedate,created,updated,customfield_10108,customfield_10102,customfield_10175,customfield_10103,customfield_10602,timetracking,labels'

	def post(self, url, cred_hash, data=''):
		'''sends a POST request

		Args:
			url (str) the URL to make a POST request
			data (dict) optional body to send with the POST request
			cred_hash (string) Authorization header value

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(JiraAPI, self).post(url=url, data=data, cred_hash=cred_hash)
		return self._process_response(response)

	def get(self, url, cred_hash):
		'''sends a GET request

		Args:
			url (str) the URL to make a POST request
			cred_hash (string) Authorization header value

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(JiraAPI, self).get(url=url, cred_hash=cred_hash)
		return self._process_response(response)

	def post_json(self, url, json_data, cred_hash):
		'''sends a POST request with JSON data

		Args:
			url (str) the URL to make a POST request
			json_data (dict) optional JSON body to send with the POST request
			cred_hash (string) Authorization header value

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(JiraAPI, self).post_json(url=url, json_data=json_data, cred_hash=cred_hash)
		return self._process_response(response)

	def put_json(self, url, json_data, cred_hash):
		'''sends a PUT request with JSON data

		Args:
			url (str) the URL to make a POST request
			json_data (dict) optional JSON body to send with the POST request
			cred_hash (string) Authorization header value

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(JiraAPI, self).put_json(url=url, json_data=json_data, cred_hash=cred_hash)
		return self._process_response(response)

	def delete(self, url, cred_hash):
		'''sends a DELETE request

		Args:
			url (str) the URL to make a POST request
			cred_hash (string) Authorization header value

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(JiraAPI, self).delete(url=url, cred_hash=cred_hash)
		return self._process_response(response)



	def _process_response(self, response):
		'''internal method that processes the response from the Jira API
		Args:
			response (dict) the response from the Jira API

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(JiraAPI, self)._process_response(response=response)

		# get error messages if status false
		if not response['status']:
			errors = []

			# if dict then get errorMessages value
			if isinstance(response['data'], dict):

				# for each error add to response
				for error_message in response['data'].values():

					# if list then add all list items 
					if isinstance(error_message, list):
							errors=errors+error_message

					elif isinstance(error_message, dict):
						# else if dict then add values to errors
						for message in error_message.values():
							errors.append(message)

			# if array instance then get errors
			elif isinstance(response['data'], list):
				errors = response['data']

			# now merge all errors into one string - new lines to breaks
			response['data'] = re.sub(r'\n', r'<br>', ','.join(errors) )

		return response
