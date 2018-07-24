#!/usr/bin/python3

class PullRequests():

	def __init__(self, code_cloud_api):
		self.code_cloud_api = code_cloud_api
		self.qa_begin = "h3. ==== QA Steps ===="
		self.qa_end = "h3. ==============="

	def generate_qa_template(self, qa_steps, repos, pull_response, diff_response):
		repo_table = self.generate_repo_table(repos, pull_response, diff_response)
		
		return """
	"""+repo_table+"""

	"""+self.qa_begin+"""

	"""+qa_steps+"""

	"""+self.qa_end+"""
	"""

	def generate_repo_table(self, repos, pull_response, diff_response):
		'''generates a QA step Jira comment with pull requests or diff links'''
		table_data = self.create_qa_header(pull_response=pull_response, diff_response=diff_response)

		for repo in repos:
			table_data += self.create_qa_table_row(repo, pull_response, diff_response)

		return table_data

	def create_qa_header(self, pull_response, diff_response):
		'''generate the QA step table header'''
		table_data = "|| Repo || Branch || Branched From ||"

		if pull_response and pull_response['status']:
			table_data += ' Pull Requests ||'
		if diff_response and diff_response['status']:
			table_data += ' Diff Links ||'

		return table_data

	def create_qa_table_row(self, repo, pull_response, diff_response):
		base_branch = repo['baseBranch']
		repository_name = repo['repositoryName']
		reviewed_branch = repo['reviewedBranch']

		# build table row
		table_data = """
|"""+repository_name+'|'+reviewed_branch+'|'+base_branch+'|'
		
		# build diff/request table box
		if diff_response and diff_response['status']:
			table_data += self._create_diff_td(repository_name=repository_name, diff_response=diff_response)
			
		if pull_response and pull_response['status']:
			table_data += self._create_pull_td(repository_name=repository_name, pull_response=pull_response)

		return table_data

	def _create_diff_td(self, repository_name, diff_response):
		'''creates table box for a diff'''
		matching_diff = [x for x in diff_response['data'] if repository_name in x['repo']]

		if len(matching_diff):
			link = matching_diff[0]['link']
			repo = matching_diff[0]['repo']
			return f'[{repo}|{link}]|'

	def _create_pull_td(self, repository_name, pull_response):
		'''creates table box for a pull request'''
		print('pull_response', pull_response)
		repo_pull_link = self.get_pull_request_link(pull_response=pull_response, repository_name=repository_name)
		return f'[{repository_name}|{repo_pull_link}]|'
		
		# matching_diff = [x for x in pull_response['data'] if repository_name in x['repo']]

		# if len(matching_diff):
		# 	link = matching_diff[0]['link']
		# 	repo = matching_diff[0]['repo']
		# 	return f'| [{repo}|{link}] |'

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

	def get_diff_link(self, repository_name, reviewed_branch, base_branch):
		'''generates a diff link from a branch object'''
		link = f'{self.code_cloud_api.code_cloud_path}/{repository_name}/{self.code_cloud_api.code_cloud_path2}'
		link += f'?targetBranch=refs%2Fheads%2F{base_branch}'
		if reviewed_branch:
			link += f'&sourceBranch=refs%2Fheads%2F{reviewed_branch}'

		return link

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