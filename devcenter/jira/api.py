"""Class wrapper for API calls to Jira."""
from base64 import b64decode
import json
import os
import re
import ssl
import urllib.parse

import certifi
import requests
from requests.exceptions import ProxyError, SSLError

from .config import *
from devcenter.common.api import DevCenterAPI


class JiraAPI(DevCenterAPI):
	"""Wrapper to call API endpoints."""

	def __init__(self):
		"""Setup base URLs."""
		DevCenterAPI.__init__(self)

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
		session_obj.verify = False

		try:
			response = session_obj.post(url=url, data=data, headers=headers)
			if response.status_code in [200,201,204]:
				return {'status': True, 'data': session_obj}
			else:
				return {'status': False, 'data': response.text}
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"get_session error: {e}" }

	def get(self, url, cred_hash='', cookies=None):
		"""Make a get request and return JSON."""
		cookies = cookies if cookies is None else {}
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		
		headers = { }
		try:
			filter_data = session_obj.get(url=url, cookies=cookies, headers=headers)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"get error:  {e}" }
		return self._process_response( self._process_json(filter_data=filter_data) )

	def get_raw(self, url, cred_hash=''):
		"""Make a GET request and return the raw response."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']

		headers = { }
		try:
			filter_data = session_obj.get(url=url)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"get_raw error: {e}" }
		return filter_data

	def post(self, url, data='', cred_hash=''):
		"""Make a POST request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']

		headers = { }
		try:
			if data:
				filter_data = session_obj.post(url=url, data=data, headers=headers)
			else:
				filter_data = session_obj.post(url=url, headers=headers)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"post error: {e}" }
		return self._process_response( self._process_json(filter_data=filter_data) )

	def post_json(self, url, json_data, cred_hash=''):
		"""Make a POST request with JSON body and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']

		headers = { 'Content-Type': 'application/json' }
		try:
			filter_data = session_obj.post(url, json=json_data, headers=headers)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"post_json error: {e}" }
		return self._process_response( self._process_json(filter_data=filter_data) )

	def put(self, url, data='', cred_hash=''):
		"""Make a PUT request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']

		headers = { }
		try:
			if data:
				filter_data = session_obj.put(url=url, data=data, headers=headers)
			else:
				filter_data = session_obj.put(url=url, headers=headers)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"put error: {e}" }
		return self._process_response( self._process_json(filter_data=filter_data) )

	def put_json(self, url, json_data, cred_hash=''):
		"""Make a PUT request with JSON body and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']

		headers = { 'Content-Type': 'application/json' }
		try:
			filter_data = session_obj.put(url=url, json=json_data, headers=headers)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"put_json error: {e}" }
		return self._process_response( self._process_json(filter_data=filter_data) )

	def delete(self, url, cred_hash=''):
		"""Make a DELETE request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']

		headers = { }
		try:
			filter_data = session_obj.delete(url=url, headers=headers)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"delete error: {e}" }
		return self._process_response( self._process_json(filter_data=filter_data) )

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