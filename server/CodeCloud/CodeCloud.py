#!/usr/bin/python3

from .CodeCloudAPI import CodeCloudAPI
from .Git import Git


class CodeCloud(Git):
	def __init__(self):
		self.code_cloud_api = CodeCloudAPI()
		self.code_cloud_path = '/projects/ST_M5DTI/repos'
		self.code_cloud_path2 = 'compare/diff'
		
		Git.__init__(self, self.code_cloud_api)

	def generate_pull_request_comment(self, repos, pull_response):
		'''
		'''
		comment = ''

		for repo in repos:
			baseBranch = repo['baseBranch']
			repositoryName = repo['repositoryName']
			reviewedBranch = repo['reviewedBranch']

			pull_request_link = self.get_pull_request_link(pull_response=pull_response, repositoryName=repositoryName)

			# get link to code cloud link
			branch_url = f'{self.code_cloud_api.code_cloud_api}{self.code_cloud_path}/{repositoryName}/{self.code_cloud_path2}?targetBranch=refs%2Fheads%2F{baseBranch}&sourceBranch=refs%2Fheads%2F{reviewedBranch}'
			comment = comment+'\n{color:red}'+repositoryName+'{color}: [Code Cloud|'+branch_url+']'

			# add pull request link if found
			if pull_request_link:
				comment += ' [Pull Request|'+pull_request_link+'/diff]'

		return comment

	def get_pull_request_link(self, pull_response, repositoryName):
		'''
		'''
		pull_request_link = ''

		if pull_response.get('status', False):
			for request in pull_response.get('data'):

				if request.get('status', False):
					repo_name = request.get('data').get('toRef').get('repository').get('name')

					if repo_name.lower() == repositoryName.lower():
						pull_request_link = request.get('data').get(
							'links').get('self')[0].get('href')

		return pull_request_link

	def add_comment_to_pull_request(self, repo_name, pull_request_id, comment, cred_hash):
		'''
		'''
		url = f'{self.code_cloud_api.code_cloud_branches_api}/{repo_name}/pull-requests/{pull_request_id}/comments'
		return self.post(url=url, post_data={'text':comment}, cred_hash=cred_hash)

	def add_reviewer_to_pull_request(self, username, repo_name, pull_request_id, cred_hash):
		'''
		'''
		url = f'{self.code_cloud_api.code_cloud_branches_api}/{repo_name}/pull-requests/{pull_request_id}/participants'
		post_data = {
		'role':'reviewer', 
		'user':{
				'name': username,
				'slug': username,
				'type': 'NORMAL'
			}
		}

		return self.post(url=url, post_data=post_data, cred_hash=cred_hash)
