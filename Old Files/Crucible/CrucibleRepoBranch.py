#!/usr/bin/python3
import re

class CrucibleRepoBranch():
	def __init__(self, crucible_api):
		self.crucible_api = crucible_api

	def add_branches(self, repos, data, crucible_id):
		self.crucible_api.manual_login(username=data['username'], password=data['password'])

		for repo in repos:
			json_data = {
				"autoUpdate": "true",
				"baseBranch": repo['baseBranch'],
				"repositoryName": repo['repositoryName'],
				"reviewedBranch": repo['reviewedBranch']
			}

		url = f'{self.crucible_api.crucible_api_branch}/{crucible_id}.json'
		response = self.crucible_api.manual_post_json(url=url, json=json_data)
		if not response['status']:
			return {'status': True, 'data': f'Could not add repo {repo}: '+response['data']}

		return response