"""Handles raw API request to Code Cloud API."""
import os

import requests
from requests.exceptions import ProxyError
from requests.packages.urllib3.exceptions import InsecureRequestWarning

from devcenter.common.api import DevCenterAPI


requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

class CodeCloudAPI(DevCenterAPI):
	"""Handles raw API request to Code Cloud API."""

	def __init__(self):
		"""Setup Code Cloud API config."""
		DevCenterAPI.__init__(self)
		self.project_name = 'ST_M5DTI'

		try:
			self.code_cloud_api = os.environ['CODE_CLOUD_URL']
		except KeyError:
			self.code_cloud_api = ''
			
		self.branch_api = f'{self.code_cloud_api}/rest/api/1.0/projects/{self.project_name}/repos'
		
		self.code_cloud_path = f'{self.code_cloud_api}/projects/{self.project_name}/repos'
		self.code_cloud_path2 = 'compare/diff'

	@classmethod
	def get_session(cls, cred_hash=''):
		"""Create a browser session."""
		session = requests.session()
		session.verify = False
		return {
			'status': True,
			'data': session
		}

	def get(self, url, cred_hash='', cookies=None):
		"""Make a get request and return JSON."""
		cookies = cookies if cookies is None else {}
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']

		headers = {'Authorization': cred_hash}
		try:
			filter_data = session_obj.get(url=url, cookies=cookies, headers=headers)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_response( self._process_json(filter_data=filter_data) )

	def post(self, url, data='', cred_hash=''):
		"""Make a POST request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']

		headers = {'Authorization': cred_hash}
		try:
			if data:
				filter_data = session_obj.post(url=url, data=data, headers=headers)
			else:
				filter_data = session_obj.post(url=url, headers=headers)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_response( self._process_json(filter_data=filter_data) )

	def put(self, url, data='', cred_hash=''):
		"""Make a PUT request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']

		headers = {'Authorization': cred_hash}
		try:
			if data:
				filter_data = session_obj.put(url=url, data=data, headers=headers)
			else:
				filter_data = session_obj.put(url=url, headers=headers)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_response( self._process_json(filter_data=filter_data) )

	def delete(self, url, cred_hash=''):
		"""Make a DELETE request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']

		headers = {'Authorization': cred_hash}
		try:
			filter_data = session_obj.delete(url, headers=headers)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
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

	@classmethod
	def _process_response(cls, response):
		"""Processes the raw response from code cloud API."""
		if 'status' not in response:
			return {"status": False, "data": 'There was no status given'}

		elif not response.get('status'):

			if 'data' not in response:
				return {"status": False, "data":  'Unknown error'}

			elif 'message' in response.get('data', {}) and response.get('data', {}):
				if isinstance(response.get('data'), str):
					return {"status": False, "data":  response['data']}
				else:
					return {"status": False, "data":  response['data']['message']}

			else:
				return {"status": False, "data":  response.get('data')}

		else:
			return response