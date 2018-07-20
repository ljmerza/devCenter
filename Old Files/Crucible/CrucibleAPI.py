#!/usr/bin/python3

import os
import requests
from ..Common.DevCenterAPI import DevCenterAPI

class CrucibleAPI(DevCenterAPI):

	def __init__(self):
		DevCenterAPI.__init__(self)
		self.crucible_url = os.environ['CRUCIBLE_URL']
		self.atl_token = os.environ['ATL_TOKEN']
		self.project_name = 'ST_M5DTI'
		self.pcr_pass = "=#= PCR PASS =#="
		
		self.crucible_api_review = f'{self.crucible_url}/rest-service/reviews-v1'
		self.crucible_api_repo = f'{self.crucible_url}/rest-service/repositories-v1'
		self.crucible_api_branch = f'{self.crucible_url}/rest/branchreview/latest/trackedbranch'

		self.code_cloud_api = os.environ['CODE_CLOUD_URL']
		self.code_cloud_pull_req = f'{self.code_cloud_api}/rest/api/latest/projects/{self.project_name}/repos'

		self.code_cloud_branches_api = f'{self.code_cloud_api}/rest/api/latest/projects/{self.project_name}/repos/'

	def post(self, url, cred_hash, data=''):
		response = super(CrucibleAPI, self).post(url=url, data=data, cred_hash=cred_hash)
		return self._process_response(response)

	def delete(self, url, cred_hash, data=''):
		response = super(CrucibleAPI, self).delete(url=url, cred_hash=cred_hash)
		return self._process_response(response)

	def get(self, url, cred_hash):
		response = super(CrucibleAPI, self).get(url=url, cred_hash=cred_hash)
		return self._process_response(response)

	def post_json(self, url, json_data, cred_hash):
		response = super(CrucibleAPI, self).post_json(url=url, json_data=json_data, cred_hash=cred_hash)
		return self._process_response(response)

	def _process_response(self, response):
		if 'status' not in response:
			return { "status": False, "data": 'There was no status given' }

		elif not response.get('status'):

			if 'data' not in response:
				return { "status": False, "data":  'Unknown error' }

			elif 'message' in response.get('data', {}) and response.get('data', {}):
				if isinstance(response.get('data'), str):
					return { "status": False, "data":  response['data']}
				else:
					return { "status": False, "data":  response['data']['message'] }

			else:
				return { "status": False, "data":  response.get('data') }

		else:
			return response

	def manual_login(self, username, password):
		self.session = requests.session()
		self.session.get(url=f'{self.crucible_url}/login')

		login_data = dict(username=username, password=password, rememberme='yes', atl_token=self.atl_token)
		self.session.post(url=f'{self.crucible_url}/login', data=login_data)

	def manual_post_json(self, url, json={}):
		if not self.session:
			return {'status': False, 'data': 'Please login first.'}

		response = self.session.post(url=url, json=json)

		if response.status_code != 200:
			return {'status': False, 'data': response.text}
		else:
			return {'status': True, 'data': response.text}
