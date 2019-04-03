"""Handle creating pull requests."""


class PullRequests():
	"""Handle creating pull requests."""

	def __init__(self, code_cloud_api):
		"""Setup code cloud APIO config."""
		self.code_cloud_api = code_cloud_api
		self.qa_begin = "h3. ==== QA Steps ===="
		self.qa_end = "h3. ==============="

	def generate_qa_template(self, qa_steps, repos, pull_response):
		"""Generate a table for QA steps."""
		repo_table = self.generate_repo_table(repos, pull_response)
		
		return """
	"""+repo_table+"""

	"""+self.qa_begin+"""

	"""+qa_steps+"""

	"""+self.qa_end+"""
	"""

	def generate_repo_table(self, repos, pull_response):
		"""Generate a table row for a repo."""
		table_data = self.create_qa_header(pull_response=pull_response)

		for repo in repos:
			table_data += self.create_qa_table_row(repo, pull_response)

		return table_data

	def create_qa_header(self, pull_response):
		"""Create the header for QA steps."""
		return "|| Repo || Branch || Branched From || Pull Requests ||"

	def create_qa_table_row(self, repo, pull_response):
		base_branch = repo['baseBranch']
		repository_name = repo['repositoryName']
		reviewed_branch = repo['reviewedBranch']

		# build table row
		table_data = """
|"""+repository_name+'|'+reviewed_branch+'|'+base_branch+'|'
		
		# build request table box
		if pull_response:
			table_data += self._create_qa_td(repository_name=repository_name, links=pull_response)
		else:
			table_data += ' |'

		return table_data

	def _create_qa_td(self, repository_name, links):
		"""Creates table box for a diff."""
		matching_link = [x for x in links['data'] if repository_name in x['repo']]

		if len(matching_link) and matching_link[0].get('link', False):
			link = matching_link[0]['link']
			repo = matching_link[0]['repo']
			return f'[{repo}|{link}]|'
		else:
			return 'ERROR|'

	def get_pull_request_link(self, pull_response, repository_name):
		"""Gets pull request link from a pull request response object."""
		pull_request_link = ''

		if pull_response.get('status', False):
			for request in pull_response.get('data'):

				if request.get('status', False):
					repo_name = request.get('data', {}).get('toRef', {}).get('repository', {}).get('name', '')

					if repo_name.lower() == repository_name.lower():
						pull_request_link = request.get('data', {}).get('links', {}).get('self', [])[0].get('href', '')

		return pull_request_link