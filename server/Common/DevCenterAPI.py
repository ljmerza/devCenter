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
		pass

	def get(self, url, cred_hash=''):
		'''makes a GET request with the given URL and returns the processed JSON

		Args:
			url (str) the URL to make a GET request
			cred_hash (string) optional Authorization header value

		Returns:
			returns a dict with status property and if success, a data property. 
			If Proxy error returns dict with status 407
		'''
		session_obj = requests.session()
		try:
			filter_data = session_obj.get(url=url, headers={ 'Authorization': cred_hash })
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
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
		session_obj = requests.session()
		try:
			filter_data = session_obj.get(url=url, headers={ 'Authorization': cred_hash })
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return filter_data

	def post(self, url, data='', cred_hash=''):
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
		session_obj = requests.session()
		try:
			if data:
				filter_data = session_obj.post(url=url, data=data, headers={ 'Authorization': cred_hash })
			else:
				filter_data = session_obj.post(url=url, headers={ 'Authorization': cred_hash })
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
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
		session_obj = requests.session()
		headers = { 'Content-Type': 'application/json', 'Authorization': cred_hash }
		try:
			filter_data = session_obj.post(url, json=json_data, headers=headers)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def put_json(self, url, json_data, cred_hash=''):
		'''makes a PUT request with the given URL and optional JSON body data.
		Returns the raw response.

		Args:
			url (str) the URL to make a POST request
			json_data (dict) JSON body to send with the POST request
			cred_hash (string) optional Authorization header value

		Returns:
			returns a dict with status property and if success, a data property. 
			If Proxy error returns dict with status 407.
		'''
		session_obj = requests.session()
		headers = { 'Content-Type': 'application/json', 'Authorization': cred_hash }
		try:
			filter_data = session_obj.put(url, json=json_data, headers=headers)
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def delete(self, url, cred_hash=''):
		'''makes a DELETE request with the given URL. Returns the raw response.

		Args:
			url (str) the URL to make a POST request
			cred_hash (string) optional Authorization header value

		Returns:
			returns a dict with status property and if success, a data property. 
			If Proxy error returns dict with status 407.
		'''
		session_obj = requests.session()
		try:
			filter_data = session_obj.delete(url, json=json_data, headers={ 'Authorization': cred_hash })
		except ProxyError:
			return { "status": False, 'data': "Proxy error 407" }
		return self._process_json(filter_data=filter_data)

	def _process_json(self, filter_data):
		'''internal method to parse JSON from responses and return status/data dict format

		Args:
			json_data (dict) JSON data it tries to parse (default '')

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
			if self._is_json(my_json=filter_data.text):
				return { "status": False, "data": json.loads(filter_data.text) }
			else:
				return { "status": False, "data": filter_data.text }

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

	def _process_response(self, response):
		'''internal method that processes the response from the API
		Args:
			response (dict) the response from the API

		Returns:
			returns a dict with status/data property. 
		'''
		# if no status
		if 'status' not in response:
			return { "status": False, "data": 'There was no status given' }
		# if status False
		elif not response['status']:
			# if not data then unknown error
			if 'data' not in response:
				return { "status": False, "data":  'Unknown error' }
			# if  data is dict then get message then return error message
			elif isinstance(response['data'], dict) and 'message' in response['data']:
				return { "status": False, "data": response['data']['message'] }
			# else just return data as error
			else:
				return { "status": False, "data": response['data'] }
		# else return response
		else:
			return response