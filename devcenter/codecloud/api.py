"""Handles raw API request to Code Cloud API."""
import os

import requests
from requests.exceptions import ProxyError
from requests.packages.urllib3.exceptions import InsecureRequestWarning

from devcenter.atlassian.api import AtlassianApi


requests.packages.urllib3.disable_warnings(InsecureRequestWarning)


class CodeCloudApi(AtlassianApi):
	"""Wrapper to call CodeCloud API endpoints."""

	def __init__(self):
		"""Setup CodeCloud API config."""
		self.project_name = 'ST_M5DTI'
		self.code_cloud_api = os.environ.get('CODE_CLOUD_URL', '')
		self.branch_api = f'{self.code_cloud_api}/rest/api/latest/projects/{self.project_name}/repos'
		self.code_cloud_path = f'{self.code_cloud_api}/projects/{self.project_name}/repos'
		self.code_cloud_path2 = 'compare/diff'

	@classmethod
	def get_session(cls, cred_hash=''):
		"""Create a browser session."""
		session = requests.session()
		session.verify = False
		session.headers.update({'Authorization': cred_hash})
		return {
			'status': True,
			'data': session
		}