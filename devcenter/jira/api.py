"""Class wrapper for API calls to Jira."""
import re
import os
import urllib.parse

from .config import *
from devcenter.common.api import DevCenterAPI


class JiraAPI(DevCenterAPI):
	"""Wrapper to call API endpoints."""

	def __init__(self):
		"""Setup base URLs."""
		DevCenterAPI.__init__(self)
		
		try:
			self.jira_url = os.environ['JIRA_URL']
		except KeyError:
			self.jira_url = ''

		self.jira_ticket = f'{self.jira_url}/browse'
		self.jira_search_url = f'{self.jira_url}/rest/api/2/search'

		self.api_base = f'{self.jira_url}/rest/api/2'
		self.api_agile_base = f'{self.jira_url}/rest/agile/1.0'
		self.component_url = f'{self.api_base}/issue'

		self.all_open_tickets = urllib.parse.quote(all_open_tickets)
		self.fields = fields
		self.cron_fields = cron_fields
		self.filters = filters

	def post(self, url, cred_hash, data=''):
		"""Makes a POST request to the Jira API."""
		response = super(JiraAPI, self).post(url=url, data=data, cred_hash=cred_hash)
		return self._process_response(response)

	def get(self, url, cred_hash):
		"""Makes a POST request to the Jira API."""
		response = super(JiraAPI, self).get(url=url, cred_hash=cred_hash)
		return self._process_response(response)

	def post_json(self, url, json_data, cred_hash):
		"""Makes a POST request to the Jira API with JSON body."""
		response = super(JiraAPI, self).post_json(url=url, json_data=json_data, cred_hash=cred_hash)
		return self._process_response(response)

	def put_json(self, url, json_data, cred_hash):
		"""Makes a PUT request to the Jira API with JSON body."""
		response = super(JiraAPI, self).put_json(url=url, json_data=json_data, cred_hash=cred_hash)
		return self._process_response(response)

	def delete(self, url, cred_hash):
		"""Makes a DELETE request to the Jira API."""
		response = super(JiraAPI, self).delete(url=url, cred_hash=cred_hash)
		return self._process_response(response)

	def _process_response(self, response):
		"""Processes the JIRA API response."""
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
			response['data'] = re.sub( r'\n', r'<br>', ','.join(errors) )

		return response