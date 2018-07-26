#!/usr/bin/python3

import os
from ..Common.DevCenterAPI import DevCenterAPI

class CodeCloudAPI(DevCenterAPI):

	def __init__(self):
		DevCenterAPI.__init__(self)
		self.project_name = 'ST_M5DTI'
		self.code_cloud_api = os.environ['CODE_CLOUD_URL']
		self.branch_api = f'{self.code_cloud_api}/rest/api/1.0/projects/{self.project_name}/repos'
		
		self.code_cloud_path = f'{self.code_cloud_api}/projects/{self.project_name}/repos'
		self.code_cloud_path2 = 'compare/diff'

	def post(self, url, cred_hash, data='', json_data=None):
		if json_data:
			response = super(CodeCloudAPI, self).post_json(url=url, json_data=json_data, cred_hash=cred_hash)
		else:
			response = super(CodeCloudAPI, self).post(url=url, data=data, cred_hash=cred_hash)
		return self._process_response(response)

	def put(self, url, cred_hash, data='', json_data=None):
		if json_data:
			response = super(CodeCloudAPI, self).put_json(url=url, json_data=json_data, cred_hash=cred_hash)
		else:
			response = super(CodeCloudAPI, self).put(url=url, data=data, cred_hash=cred_hash)
		return self._process_response(response)

	def delete(self, url, cred_hash, data=''):
		response = super(CodeCloudAPI, self).delete(url=url, cred_hash=cred_hash)
		return self._process_response(response)

	def get(self, url, cred_hash):
		response = super(CodeCloudAPI, self).get(url=url, cred_hash=cred_hash)
		return self._process_response(response)

	def _process_response(self, response):
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