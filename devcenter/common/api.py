"""Over all API for Dev Center."""
from base64 import b64decode
import json
import os

import requests
from requests.exceptions import ProxyError
from requests.packages.urllib3.exceptions import InsecureRequestWarning

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

class DevCenterAPI():
	"""Overall API for Dev Center."""

	try:
		jira_url = os.environ['JIRA_URL']
	except KeyError:
		jira_url = ''

	def get_session(self, cred_hash):
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

		url = f"{self.jira_url}/jira/rest/auth/1/session"
		data = {
			'username': username,
			'password': password
		}
		headers = { 'Content-Type': 'application/json' }
		session_obj = requests.session()
		try:
			response = session_obj.post(url=url, data=data, headers=headers, verify=False)
			print(response.text, url, response.status_code)

			if response.status_code in [200,201,204]:
				return {'status': True, 'data': response.text}
			else:
				return {'status': False, 'data': response.text}
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }


	def get(self, url, cred_hash='', cookies=None):
		cookies = cookies if cookies is None else {}
		"""Make a get request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		try:
			filter_data = session_obj.get(url=url, verify=False, cookies=cookies)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def get_raw(self, url, cred_hash=''):
		"""Make a GET request and return the raw response."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		try:
			filter_data = session_obj.get(url=url, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return filter_data

	def post(self, url, data='', cred_hash=''):
		"""Make a POST request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		try:
			if data:
				filter_data = session_obj.post(url=url, data=data, verify=False)
			else:
				filter_data = session_obj.post(url=url, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def post_json(self, url, json_data, cred_hash=''):
		"""Make a POST request with JSON body and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		headers = { 'Content-Type': 'application/json' }
		try:
			filter_data = session_obj.post(url, json=json_data, headers=headers, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def put(self, url, data='', cred_hash=''):
		"""Make a PUT request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		try:
			if data:
				filter_data = session_obj.put(url=url, data=data, verify=False)
			else:
				filter_data = session_obj.put(url=url, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def put_json(self, url, json_data, cred_hash=''):
		"""Make a PUT request with JSON body and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		headers = { 'Content-Type': 'application/json' }
		try:
			filter_data = session_obj.put(url, json=json_data, headers=headers, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def delete(self, url, cred_hash=''):
		"""Make a DELETE request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		try:
			filter_data = session_obj.delete(url, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def _process_json(self, filter_data):
		"""Process the return JSON from an API."""
		# if we have filter data and an okay status then try to parse
		if filter_data and filter_data.status_code in [200,201,204]:
			if self._is_json(my_json=filter_data.text):
				return { "status": True, "data": json.loads(filter_data.text)}
			else:
				return { "status": True }
		else:
			# else we don't have an okay status so get error and return false status
			if self._is_json(my_json=filter_data.text):
				return { "status": False, "data": json.loads(filter_data.text) }
			else:
				return { "status": False, "data": filter_data.text }

	def _is_json(self, my_json):
		"""Is the data strucutre valid JSON?"""
		try:
			json_object = json.loads(my_json)
		except ValueError:
			return False
		return True

	def _process_response(self, response):
		"""Process a raw response from an API."""
		if 'status' not in response:
			return { "status": False, "data": 'There was no status given' }

		elif not response['status']:
			if 'data' not in response:
				return { "status": False, "data":  'Unknown error' }

			elif isinstance(response['data'], dict) and 'message' in response['data']:
				return { "status": False, "data": response['data']['message'] }

			else:
				return { "status": False, "data": response['data'] }
		
		else:
			return response