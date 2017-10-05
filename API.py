#!/usr/bin/python3

import requests
from requests.auth import HTTPBasicAuth
from requests.exceptions import ProxyError
import json


class API():
	
	def __init__(self):
		self.session_obj = requests.session()

	def login_json(self, url, json, cred_hash=''):
		headers={'Content-Type': 'application/json'}
		if cred_hash:
			headers['Authorization'] = cred_hash
		try:
			filter_data = self.session_obj.post(url, json=json, headers=headers)
		except ProxyError:
			return {'status_code': 407}
		return filter_data.status_code

	def login_data(self, url, data, cred_hash=''):
		try:
			if cred_hash:
				filter_data = self.session_obj.post(url, data=data, headers={ 'Authorization' : cred_hash })
			else:
				filter_data = self.session_obj.post(url, data=data)
		except ProxyError:
			return {'status_code': 407}
		return filter_data.status_code

	def get_endpoint_data(self, url, cred_hash=''):
		try:
			if cred_hash:
				filter_data = self.session_obj.get(url=url, headers={ 'Authorization' : cred_hash })
			else:
				filter_data = self.session_obj.get(url=url)
		except ProxyError:
			return {'status_code': 407}
		return self._process_json(filter_data=filter_data)

	def get_raw_endpoint_data(self, url, cred_hash=''):
		try:
			if cred_hash:
				filter_data = self.session_obj.get(url=url, headers={ 'Authorization' : cred_hash })
			else:
				filter_data = self.session_obj.get(url=url)
		except ProxyError:
			return {'status_code': 407}
		return filter_data.text

	def post_endpoint_data(self, url, data='', cred_hash=''):
		print(url, data, cred_hash)
		try:
			if data:
				if cred_hash:
					filter_data = self.session_obj.post(url=url, data=data, headers={ 'Authorization' : cred_hash })
				else:
					filter_data = self.session_obj.post(url=url, data=data)
			else:
				if cred_hash:
					filter_data = self.session_obj.post(url=url, headers={ 'Authorization' : cred_hash })
				else:
					filter_data = self.session_obj.post(url=url)
		except ProxyError:
			return {'status_code': 407}
		return self._process_json(filter_data=filter_data)

	def json_post_endpoint_data(self, url, json_data='', cred_hash=''):
		headers={'Content-Type': 'application/json'}
		if cred_hash:
			headers['Authorization'] = cred_hash
		print('headers', headers)
		try:
			filter_data = self.session_obj.post(url, json=json_data, headers=headers)
			print('filter_data', self._process_json(filter_data=filter_data))
		except ProxyError:
			return {'status_code': 407}
		return self._process_json(filter_data=filter_data)

	def json_put_endpoint_data(self, url, json_data='', cred_hash=''):
		headers={'Content-Type': 'application/json'}
		if cred_hash:
			headers['Authorization'] = cred_hash
		try:
			filter_data = self.session_obj.put(url=url, json=json_data, headers=headers)
		except ProxyError:
			return {'status_code': 407}
		return self._process_json(filter_data=filter_data)

	def _process_json(self, filter_data=''):
		if filter_data and filter_data.status_code in [200,201,204]:
			if self.is_json(myjson=filter_data.text):
				return { "status": True, "data": json.loads(filter_data.text)}
			else:
				return { "status": True }
		json_data = { "status": False, "data": '' }
		if self.is_json(myjson=filter_data.text):
			json_data['data'] = json.loads(filter_data.text)
		return json_data

	def is_json(self, myjson):
		try:
			json_object = json.loads(myjson)
		except ValueError:
			return False
		return True