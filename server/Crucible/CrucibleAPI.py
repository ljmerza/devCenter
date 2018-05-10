#!/usr/bin/python3

import os
import requests

from Common.DevCenterAPI import DevCenterAPI

class CrucibleAPI(DevCenterAPI):

	def __init__(self):
		'''creates a CrucibleAPI interface - used as an adapter for Crucible API requests
		and sets all Crucible API endpoints
		Args:
			None

		Returns:
			An instance of CrucibleAPI
		'''
		DevCenterAPI.__init__(self)
		self.crucible_url = os.environ['CRUCIBLE_URL']
		self.atl_token = os.environ['ATL_TOKEN']
		
		self.crucible_api_review = f'{self.crucible_url}/rest-service/reviews-v1'
		self.crucible_api_repo = f'{self.crucible_url}/rest-service/repositories-v1'
		self.crucible_api_changelog = f'{self.crucible_url}/changelog-ajax'
		self.crucible_api_branch = f'{self.crucible_url}/rest/branchreview/latest/trackedbranch'

	def post(self, url, cred_hash, data=''):
		'''sends a POST request
		Args:
			url (str) the URL to make a POST request
			data (dict) optional body to send with the POST request
			cred_hash (str) Authorization header value

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(CrucibleAPI, self).post(url=url, data=data, cred_hash=cred_hash)
		return self._process_response(response)

	def get(self, url, cred_hash):
		'''sends a GET request
		Args:
			url (str) the URL to make a POST request
			cred_hash (str) Authorization header value

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(CrucibleAPI, self).get(url=url, cred_hash=cred_hash)
		return self._process_response(response)

	def post_json(self, url, json_data, cred_hash):
		'''sends a POST request with JSON data
		Args:
			url (str) the URL to make a POST request
			json_data (dict) optional JSON body to send with the POST request
			cred_hash (str) Authorization header value

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(CrucibleAPI, self).post_json(url=url, json_data=json_data, cred_hash=cred_hash)
		return self._process_response(response)

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
		elif not response.get('status'):
			# if not data then unknown error
			if 'data' not in response:
				return { "status": False, "data":  'Unknown error' }
			# if message in data then return error message
			elif 'message' in response.get('data', {}) and response.get('data', {}):
				if isinstance(response.get('data'), str):
					return { "status": False, "data":  response['data']}
				else:
					return { "status": False, "data":  response['data']['message'] }
			# else just return data as error
			else:
				return { "status": False, "data":  response.get('data') }
		# else return response
		else:
			return response

	def manual_login(self, username, password):
		'''Manually logs into Crucible
		'''
		# get login page
		self.session = requests.session()
		self.session.get(url=f'{self.crucible_url}/login')
		# try to login
		login_data = dict(username=username, password=password, rememberme='yes', atl_token=self.atl_token)
		self.session.post(url=f'{self.crucible_url}/login', data=login_data)

	def manual_post_json(self, url, json={}):
		'''Manually make a POST request
		'''
		# make sure we have a session
		if not self.session:
			return {'status': False, 'data': 'Please login first.'}

		# post json
		response = self.session.post(url=url, json=json)

		# process response
		if response.status_code != 200:
			return {'status': False, 'data': response.text}
		else:
			return {'status': True, 'data': response.text}


