#!/usr/bin/python3

import os

import sys
sys.path.append('..')
from Common import DevCenterAPI

class CrucibleAPI(DevCenterAPI.DevCenterAPI):

	def __init__(self):
		'''creates a CrucibleAPI interface - used as an adapter for Crucible API requests
		and sets all Crucible API endpoints
		Args:
			None

		Returns:
			An instance of CrucibleAPI
		'''
		DevCenterAPI.DevCenterAPI.__init__(self)
		self.crucible_url = os.environ['CRUCIBLE_URL']
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
