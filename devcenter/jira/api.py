"""Class wrapper for API calls to Jira."""
from base64 import b64decode
import json
import os
import re
import urllib.parse

import requests
from requests.exceptions import ProxyError, SSLError

from .config import fields, cron_fields, filters, all_open_tickets
from devcenter.atlassian.api import AtlassianApi


class JiraAPI(AtlassianApi):
	"""Wrapper to call JIRA API endpoints."""

	def __init__(self):
		"""Setup base URLs."""

		self.dir_path = os.path.dirname(os.path.realpath(__file__))
		self.jira_url = os.environ.get('JIRA_URL', '')

		self.jira_ticket = f'{self.jira_url}/browse'
		self.jira_search_url = f'{self.jira_url}/rest/api/2/search'

		self.api_base = f'{self.jira_url}/rest/api/2'
		self.api_agile_base = f'{self.jira_url}/rest/agile/1.0'
		self.component_url = f'{self.api_base}/issue'

		self.all_open_tickets = urllib.parse.quote(all_open_tickets)
		self.fields = fields
		self.cron_fields = cron_fields
		self.filters = filters

	def get_session(self, cred_hash):
		"""Converts basic authentication (legacy) to cookie sessions."""
		basic, *creds = cred_hash.split(' ')
		if not creds:
			return {'status': False, 'data': 'No credentials found.'}

		creds = creds[0]
		username = ''
		password =  ''
		try:
			creds = b64decode(creds).decode("utf-8")
			username, password = creds.split(':')
		except:
			return {'status': False, 'data': 'Could not decode credentials.'}

		url = f"{self.jira_url}/rest/auth/1/session"
		data = {
			"username": username,
			"password": password
		}
		data = json.dumps(data)
		headers = { 'Content-Type': 'application/json' }
		session_obj = requests.session()

		cert_path = f"{self.dir_path}/allcerts.pem"
		session_obj.verify = False
		
		try:
			response = session_obj.post(url=url, data=data, headers=headers)
			if response.status_code in [200,201,204]:
				return {'status': True, 'data': session_obj}
			else:
				return {'status': False, 'data': response.text}
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"get_session error: {e}" }

	def process_response(self, response):
		"""Processes the JIRA API response."""
		response = super(JiraAPI, self).process_response(response=response)

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