"""Base Atlassian API."""
import json

import requests
from requests.exceptions import ProxyError, SSLError


class AtlassianApi():
	"""Base Atlassian API."""

	def get(self, url, cred_hash='', cookies=None):
		"""Make a get request and return JSON."""
		cookies = cookies if cookies is None else {}
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		try:
			response = session_obj.get(url=url, cookies=cookies)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"get error: {e}" }
		return self.process_response(response=response)

	def post(self, url, data='', cred_hash=''):
		"""Make a POST request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		try:
			if data:
				response = session_obj.post(url=url, data=data)
			else:
				response = session_obj.post(url=url)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"post error: {e}" }
		return self.process_response(response=response)

	def put(self, url, data='', cred_hash=''):
		"""Make a PUT request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		try:
			if data:
				response = session_obj.put(url=url, data=data)
			else:
				response = session_obj.put(url=url)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"put error: {e}" }
		return self.process_response(response=response)

	def delete(self, url, cred_hash=''):
		"""Make a DELETE request and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		try:
			response = session_obj.delete(url)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"delete error: {e}" }
		return self.process_response(response=response)

	def post_json(self, url, json_data, cred_hash=''):
		"""Make a POST request with JSON body and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		headers = { 'Content-Type': 'application/json' }
		try:
			response = session_obj.post(url, json=json_data, headers=headers)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"post_json error: {e}" }
		return self.process_response(response=response)

	def put_json(self, url, json_data, cred_hash=''):
		"""Make a PUT request with JSON body and return JSON."""
		session_obj = self.get_session(cred_hash=cred_hash)
		if not session_obj['status']: return session_obj
		session_obj = session_obj['data']
		headers = { 'Content-Type': 'application/json' }
		try:
			response = session_obj.put(url=url, json=json_data, headers=headers)
		except (ProxyError, SSLError, OSError) as e:
			return { "status": False, 'data': f"put_json error: {e}" }
		return self.process_response(response=response)

	@classmethod
	def process_json(cls, response):
		"""Process the return JSON from an API."""
		# if we have filter data and an okay status then try to parse
		status = response.status_code in [200,201,204]
		try:
			response = { "status": status, "data": json.loads(response.text)}
		except ValueError:
			response = { "status": status, "data": response.text }
		return response

	@classmethod
	def process_response(cls, response):
		"""Process a raw response from an API."""
		response = cls.process_json(response=response)

		if not response.get('status'):
			if 'data' not in response:
				return { "status": False, "data":  'Unknown error' }
			elif isinstance(response.get('data'), dict) and 'message' in response.get('data'):
				return { "status": False, "data": response.get('data').get('message') }
			else:
				return { "status": False, "data": response.get('data', '') }
		
		return response