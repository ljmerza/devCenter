#!/usr/bin/python3

import os

import sys
sys.path.append('..')
from Common import DevCenterAPI

class CrucibleAPI(DevCenterAPI.DevCenterAPI):

	def __init__(self):
		'''creates a CrucibleAPI interface - used as an adapter for Crucible API requests
		Args:
			None

		Returns:
			An instance of CrucibleAPI
		'''
		DevCenterAPI.DevCenterAPI.__init__(self)

	def post(self, url, cred_hash, data=''):
		'''sends a POST request
		Args:
			url (str) the URL to make a POST request
			data (dict) optional body to send with the POST request
			cred_hash (string) Authorization header value

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(CrucibleAPI, self).post(url=url, data=data, cred_hash=cred_hash)
		return self._process_response(response)

	def get(self, url, cred_hash):
		'''sends a GET request
		Args:
			url (str) the URL to make a POST request
			cred_hash (string) Authorization header value

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
			cred_hash (string) Authorization header value

		Returns:
			returns a dict with status/data property. 
		'''
		response = super(CrucibleAPI, self).post_json(url=url, json_data=json_data, cred_hash=cred_hash)
		return self._process_response(response)

	def _process_response(self, response):
		'''internal method that processes the response from Crucible API
		Args:
			response (dict) the response from Crucible API

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
			# if message in data then return error message
			elif 'message' in response['data']:
				return { "status": False, "data":  response['data']['message'] }
			# else just return data as error
			else:
				return { "status": False, "data":  response['data'] }
		# else return response
		else:
			return response
