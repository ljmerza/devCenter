import os
import re

def generate_username(self, username):
	'''get real username if not working
	Args:
			None
			
		Returns:
			None
		'''
		if(len(username) == 6):
			return username
		else:
			return username[-6:]

def sort_data_by(self, issues, filter_key):
	'''
	Args:
		issues (array<dict>) array of Jira issues
		
	Returns:
		None
	'''
	return sorted(issues, key=lambda k: k['filter_key']) 
	

def format_qa_steps(self, qa_steps):
	'''
	Args:
		None
		
	Returns:
		None
	'''
	cnt = it.count()
	next(cnt)
	qa_steps = qa_steps.replace('\=','').replace('\\','')
	qa_steps = re.sub(r"# ", lambda x: '{}. '.format(next(cnt)), qa_steps)
	return qa_steps


def generate_qa_template(self, qa_steps, repos, crucible_id):
	'''
	Args:
		None
		
	Returns:
		None
	'''
	crucible_url = os.environ['CRUCIBLE_URL']
	review_base = f'{crucible_url}/cru/'
	qa_begin = "h2. ============================ QA Steps ============================"
	qa_end = "h2. ================================================================="

	repo_table = generate_repo_table(repos)
		return """
"""+repo_table+"""


"""+'[Crucible Review|'+review_base+crucible_id+"""]


"""+qa_begin+"""

"""+qa_steps+"""

"""+qa_end+"""
		"""


def generate_repo_table(self, repos):
	'''generates the repos table for a Jira comment geiven an array of repos
	Args:
		repos (Array<dict>) an array of repo dicts with: 
			baseBranch (str) the branch you branched from
			repositoryName (str) the repo name
			reviewedBranch (str) the branch to review
	Returns:
		string of a Jita comment table of repos
	'''
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
	# return table data
	return table_data