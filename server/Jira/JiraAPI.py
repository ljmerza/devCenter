#!/usr/bin/python3

import os
from Common import DevCenterAPI

class JiraAPI(DevCenterAPI.DevCenterAPI):
	'''used as an adapter for Jira API requests'''

	def __init__(self):
		'''creates a JiraAPI interface
		and sets all Jira API endpoints

		Args:
			None

		Returns:
			An instance of JiraAPI
		'''
		DevCenterAPI.DevCenterAPI.__init__(self)
		self.jira_url = os.environ['JIRA_URL']
		self.jira_ticket = f'{self.jira_url}/browse'
		self.crucible_url = os.environ['CRUCIBLE_URL']
		self.crcible_review = f'{self.crucible_url}/cru/'
		self.api_base = f'{self.jira_url}/rest/api/2'

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
		print(response)
		return self._process_response(response)

	def _process_response(self, response):
		'''internal method that processes the response from the Jira API
		Args:
			response (dict) the response from the Jira API

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(JiraAPI, self)._process_response(response=response)
		# if we have errorMessages then pull them out
		if 'data' in response:
			if 'errorMessages' in response['data']:
				response['data'] = response['data']['errorMessages']
				# if only one error message then dont leave in array
				if len(response['data']) == 1:
					response['data'] = response['data'][0]
		return response
