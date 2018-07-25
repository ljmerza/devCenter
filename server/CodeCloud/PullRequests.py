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
		return "|| Repo || Branch || Branched From || Pull Requests || Diff Links ||"

	def create_qa_table_row(self, repo, pull_response, diff_response):
		base_branch = repo['baseBranch']
		repository_name = repo['repositoryName']
		reviewed_branch = repo['reviewedBranch']

		# build table row
		table_data = """
|"""+repository_name+'|'+reviewed_branch+'|'+base_branch+'|'
		
		# build diff/request table box
		if pull_response:
			table_data += self._create_qa_td(repository_name=repository_name, links=pull_response)
		else:
			table_data += ' |'

		if diff_response:
			table_data += self._create_qa_td(repository_name=repository_name, links=diff_response)
		else:
			table_data += ' |'

		return table_data

	def _create_qa_td(self, repository_name, links):
		'''creates table box for a diff'''
		matching_link = [x for x in links['data'] if repository_name in x['repo']]

		if len(matching_link) and matching_link[0].get('link', False):
			link = matching_link[0]['link']
			repo = matching_link[0]['repo']
			return f'[{repo}|{link}]|'
		else:
			return 'ERROR|'

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