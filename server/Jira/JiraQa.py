class JiraQa():
	def _init__(self):
		self.qa_begin = "h3. ==== QA Steps ===="
		self.qa_end = "h3. ==============="

	def generate_qa_template(qa_steps, repos, pull_request_comments=''):
		repo_table = self.generate_repo_table(repos)
		
		return """
	"""+repo_table+"""

	"""+pull_request_comments+"""

	"""+self.qa_begin+"""

	"""+qa_steps+"""

	"""+self.qa_end+"""
	"""

	def generate_repo_table(repos):
		# create table header
		table_data = "|| Repo || Branch || Branched From ||"

		# for each repo create table row
		for repo in repos:
			# get repo data
			baseBranch = repo['baseBranch']
			repositoryName = repo['repositoryName']
			reviewedBranch = repo['reviewedBranch']

			# create new table row
			table_data+="""
	|"""+repositoryName+'|'+reviewedBranch+'|'+baseBranch+'|'

		return table_data