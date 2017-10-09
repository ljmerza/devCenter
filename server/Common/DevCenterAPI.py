#!/usr/bin/python3

import requests
from requests.exceptions import ProxyError
import json


class DevCenterAPI():
	
	def __init__(self):
		'''creates a request session and returns an instance of this DevCenterAPI Class

		Args:
			None

		Returns:
			an API object
		'''
		self.session_obj = requests.session()

	def get(self, url, cred_hash=''):
		'''makes a GET request with the given URL and returns the processed JSON

		Args:
			url (str) the URL to make a GET request
			cred_hash (string) optional Authorization header value

		Returns:
			returns a dict with status property and if success, a data property. 
			If Proxy error returns dict with status 407
		'''
		try:
			filter_data = self.session_obj.get(url=url, headers={ 'Authorization': cred_hash })
		except ProxyError:
			return { 'status_code': 407 }
		return self._process_json(filter_data=filter_data)

	def get_raw(self, url, cred_hash=''):
		'''makes a GET request with the given URL and returns the raw response

		Args:
			url (str) the URL to make a GET request
			cred_hash (string) optional Authorization header value

		Returns:
			returns the raw text response from the GET request. 
			If Proxy error returns dict with status 407
		'''
		try:
			filter_data = self.session_obj.get(url=url, headers={ 'Authorization': cred_hash })
		except ProxyError:
			return { 'status_code': 407 }
		return filter_datalm240n-112271-TeamDB-GUI-Build-container-for-new-GUI>>>>

	def post(self, url, cred_hash='', data=''):
		'''makes a POST request with the given URL and optional body data.
		Returns the raw response.

		Args:
			url (str) the URL to make a POST request
			data (str) optional body to send with the POST request (default '')
			cred_hash (string) optional Authorization header value

		Returns:
			returns a dict with status property and if success, a data property. 
			If Proxy error returns dict with status 407.
		'''
		try:
			if data:
				filter_data = self.session_obj.post(url=url, data=data, headers={ 'Authorization': cred_hash })
			else:
				filter_data = self.session_obj.post(url=url, headers={ 'Authorization': cred_hash })
		except ProxyError:
			return {'status_code': 407}
		return self._process_json(filter_data=filter_data)

	def post_json(self, url, json_data, cred_hash=''):
		'''makes a POST request with the given URL and optional JSON body data.
		Returns the raw response.

		Args:
			url (str) the URL to make a POST request
			json_data (dict) JSON body to send with the POST request
			cred_hash (string) optional Authorization header value

		Returns:
			returns a dict with status property and if success, a data property. 
			If Proxy error returns dict with status 407.
		'''
		headers = { 'Content-Type': 'application/json', 'Authorization': cred_hash }
		try:
			filter_data = self.session_obj.post(url, json=json_data, headers=headers)
		except ProxyError:
			return {'status_code': 407}
		return self._process_json(filter_data=filter_data)

	def _process_json(self, filter_data=''):
		'''internal method to parse JSON from responses and return status/data dict format

		Args:
			json_data (dict) optional JSON data it tries to parse (default '')

		Returns:
			returns a dict with status and optional data properties
		'''
		# if we have filter data and an okay status then try to parse
		if filter_data and filter_data.status_code in [200,201,204]:
			if self._is_json(my_json=filter_data.text):
				# ok status and JSON is okay so return true with data
				return { "status": True, "data": json.loads(filter_data.text)}
			else:
				# ok status no no JSON so just return status
				return { "status": True }
		else:
			# else we don't have an okay status so get error and return false status
			json_data = { "status": False, "data": '' }
			if self._is_json(my_json=filter_data.text):
				json_data['data'] = json.loads(filter_data.text)
			return json_data

	def _is_json(self, my_json):
		'''internal method to see if given data is in JSON format

		Args:
			my_json (dict) JSON to data to check if is JSON

		Returns:
			a boolean if data given is in proper JSON format or not
		'''	
		try:
			json_object = json.loads(my_json)
		except ValueError:
			return False
		return True