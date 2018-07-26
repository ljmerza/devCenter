#!/usr/bin/python3

import requests
from requests.exceptions import ProxyError
import json

from requests.packages.urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

class DevCenterAPI():
	
	def __init__(self):
		pass

	def get(self, url, cred_hash='', cookies={}):
		session_obj = requests.session()
		try:
			filter_data = session_obj.get(url=url, headers={ 'Authorization': cred_hash }, verify=False, cookies=cookies)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def get_raw(self, url, cred_hash=''):
		session_obj = requests.session()
		try:
			filter_data = session_obj.get(url=url, headers={ 'Authorization': cred_hash }, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return filter_data

	def post(self, url, data='', cred_hash=''):
		session_obj = requests.session()
		try:
			if data:
				filter_data = session_obj.post(url=url, data=data, headers={ 'Authorization': cred_hash }, verify=False)
			else:
				filter_data = session_obj.post(url=url, headers={ 'Authorization': cred_hash }, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def post_json(self, url, json_data, cred_hash=''):
		session_obj = requests.session()
		headers = { 'Content-Type': 'application/json', 'Authorization': cred_hash }
		try:
			filter_data = session_obj.post(url, json=json_data, headers=headers, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def put(self, url, data='', cred_hash=''):
		session_obj = requests.session()
		try:
			if data:
				filter_data = session_obj.put(url=url, data=data, headers={ 'Authorization': cred_hash }, verify=False)
			else:
				filter_data = session_obj.put(url=url, headers={ 'Authorization': cred_hash }, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def put_json(self, url, json_data, cred_hash=''):
		session_obj = requests.session()
		headers = { 'Content-Type': 'application/json', 'Authorization': cred_hash }
		try:
			filter_data = session_obj.put(url, json=json_data, headers=headers, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def delete(self, url, cred_hash=''):
		session_obj = requests.session()
		try:
			filter_data = session_obj.delete(url, headers={ 'Authorization': cred_hash }, verify=False)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def _process_json(self, filter_data):
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
		try:
			json_object = json.loads(my_json)
		except ValueError:
			return False
		return True

	def _process_response(self, response):
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