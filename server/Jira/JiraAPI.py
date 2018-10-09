#!/usr/bin/python3

import urllib.parse
import os
import re
from Common.DevCenterAPI import DevCenterAPI
from Jira.JiraConfig import *

class JiraAPI(DevCenterAPI):

	def __init__(self):
		DevCenterAPI.__init__(self)
		
		self.jira_url = os.environ['JIRA_URL']
		self.jira_ticket = f'{self.jira_url}/browse'
		self.jira_search_url = f'{self.jira_url}/rest/api/2/search'

		self.crucible_url = os.environ['CRUCIBLE_URL']
		self.crcible_review = f'{self.crucible_url}/cru/'
		self.api_base = f'{self.jira_url}/rest/api/2'
		self.api_agile_base = f'{self.jira_url}/rest/agile/1.0'

		self.all_open_tickets = urllib.parse.quote(all_open_tickets)
		self.fields = fields
		self.cron_fields = cron_fields
		self.filters = filters

	def post(self, url, cred_hash, data=''):
		response = super(JiraAPI, self).post(url=url, data=data, cred_hash=cred_hash)
		return self._process_response(response)

	def get(self, url, cred_hash):
		response = super(JiraAPI, self).get(url=url, cred_hash=cred_hash)
		return self._process_response(response)

	def post_json(self, url, json_data, cred_hash):
		response = super(JiraAPI, self).post_json(url=url, json_data=json_data, cred_hash=cred_hash)
		return self._process_response(response)

	def put_json(self, url, json_data, cred_hash):
		response = super(JiraAPI, self).put_json(url=url, json_data=json_data, cred_hash=cred_hash)
		return self._process_response(response)

	def delete(self, url, cred_hash):
		response = super(JiraAPI, self).delete(url=url, cred_hash=cred_hash)
		return self._process_response(response)



	def _process_response(self, response):
		response = super(JiraAPI, self)._process_response(response=response)

		if not response['status']:
			errors = []

			if isinstance(response['data'], dict):
				for error_message in response['data'].values():

					if isinstance(error_message, list):
							errors=errors+error_message

					elif isinstance(error_message, dict):
						for message in error_message.values():
							errors.append(message)

			elif isinstance(response['data'], list):
				errors = response['data']

			# now merge all errors into one string - new lines to breaks
			response['data'] = re.sub(r'\n', r'<br>', ','.join(errors) )

		return response
