"""Handles raw API request to Code Cloud API."""
import os

from devcenter.common.api import DevCenterAPI


class CodeCloudAPI(DevCenterAPI):
	"""Handles raw API request to Code Cloud API."""

	def __init__(self):
		"""Setup Code Cloud API config."""
		DevCenterAPI.__init__(self)
		self.project_name = 'ST_M5DTI'

		try:
			self.code_cloud_api = os.environ['CODE_CLOUD_URL']
		except KeyError:
			self.code_cloud_api = ''
			
		self.branch_api = f'{self.code_cloud_api}/rest/api/1.0/projects/{self.project_name}/repos'
		
		self.code_cloud_path = f'{self.code_cloud_api}/projects/{self.project_name}/repos'
		self.code_cloud_path2 = 'compare/diff'

	def post(self, url, cred_hash, data='', json_data=None):
		"""Makes a POST request."""
		if json_data:
			response = super(CodeCloudAPI, self).post_json(url=url, json_data=json_data, cred_hash=cred_hash)
		else:
			response = super(CodeCloudAPI, self).post(url=url, data=data, cred_hash=cred_hash)
		return self._process_response(response)

	def put(self, url, cred_hash, data='', json_data=None):
		"""Makes a PUT request."""
		if json_data:
			response = super(CodeCloudAPI, self).put_json(url=url, json_data=json_data, cred_hash=cred_hash)
		else:
			response = super(CodeCloudAPI, self).put(url=url, data=data, cred_hash=cred_hash)
		return self._process_response(response)

	def delete(self, url, cred_hash, data=''):
		"""Makes a DELETE request."""
		response = super(CodeCloudAPI, self).delete(url=url, cred_hash=cred_hash)
		return self._process_response(response)

	def get(self, url, cred_hash):
		"""Makes a GET request."""
		response = super(CodeCloudAPI, self).get(url=url, cred_hash=cred_hash)
		return self._process_response(response)

	def _process_response(self, response):
		"""Processes the raw response from code cloud API."""
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