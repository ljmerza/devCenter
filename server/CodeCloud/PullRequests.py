#!/usr/bin/python3

class PullRequests():

	def __init__(self, code_cloud_api):
		self.code_cloud_api = code_cloud_api

	def generate_pull_request_comment(self, repos, pull_response):
		comment = ''

		for repo in repos:
			base_branch = repo['baseBranch']
			repository_name = repo['repositoryName']
			reviewed_branch = repo['reviewedBranch']

			pull_request_link = self.get_pull_request_link(pull_response=pull_response, repository_name=repository_name)
			branch_url = self.get_diff_link(repository_name, reviewed_branch, base_branch)

			# get link to code cloud link
			comment = comment+'\n{color:red}'+repository_name+'{color}: [Code Cloud|'+branch_url+']'

			# add pull request link if found
			if pull_request_link:
				comment += ' [Pull Request|'+pull_request_link+'/diff]'

		return comment

	def get_diff_link(self, repository_name, reviewed_branch, base_branch):
		'''generates a diff link from a branch object'''
		link = f'{self.code_cloud_api.code_cloud_path}/{repository_name}/{self.code_cloud_api.code_cloud_path2}'
		link += f'?targetBranch=refs%2Fheads%2F{base_branch}'
		if reviewed_branch:
			link += f'&sourceBranch=refs%2Fheads%2F{reviewed_branch}'

		return link

	def get_pull_request_link(self, pull_response, repository_name):
		'''gets pull request link from a pull request response object'''
		pull_request_link = ''

		if pull_response.get('status', False):
			for request in pull_response.get('data'):

				if request.get('status', False):
					repo_name = request.get('data', {}).get('toRef', {}).get('repository', {}).get('name', '')

					if repo_name.lower() == repository_name.lower():
						pull_request_link = request.get('data', {}).get('links', {}).get('self', [])[0].get('href', '')

		return pull_request_link

	def generate_diff_links(self, repos, master_branch=''):
		'''generates diff links from given ticket branches'''
		response = {'status': True, 'data': []}

		for repo in repos:
			base_branch = repo['baseBranch']
			repository_name = repo['repositoryName']
			reviewed_branch = repo['reviewedBranch']

			response['data'].append({
				'link': self.get_diff_link(repository_name, reviewed_branch, base_branch),
				'repo': repository_name
			})
		
		return response