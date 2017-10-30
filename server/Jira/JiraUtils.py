import os
import re

def generate_username(username):
	'''gets real username if not working

	Args:
		None
			
	Returns:
		None
	'''
	if(len(username) == 6):
		return username
	else:
		return username[-6:]

def sort_data_by(issues, filter_key):
	'''sort formatted Jira tickets by a key

	Args:
		issues (array<dict>) array of Jira issues
		filter_key (str) the key to sort the Jira tickets by
		
	Returns:
		None
	'''
	return sorted(issues, key=lambda k: k['filter_key']) 
	

def format_qa_steps(qa_steps):
	'''convert QA steps from encoded to regular ASCII

	Args:
		qa_steps (str) the QA step string to convert
		
	Returns:
		the QA step string
	'''
	cnt = it.count()
	next(cnt)
	qa_steps = qa_steps.replace('\=','').replace('\\','')
	qa_steps = re.sub(r"# ", lambda x: '{}. '.format(next(cnt)), qa_steps)
	return qa_steps


def generate_qa_template(qa_steps, repos, crucible_id):
	'''generates the QA steps in proper format

	Args:
		qa_steps (str) the QA step string
		repos (Array<dict>) an array of repo dicts with: 
			baseBranch (str) the branch you branched from
			repositoryName (str) the repo name
			reviewedBranch (str) the branch to review
		crucible_id (str) the Crucible ID of the review created
		
	Returns:
		The formatted QA table string
	'''
	crucible_url = os.environ['CRUCIBLE_URL']

	qa_begin = "h2. ============================ QA Steps ============================"
	qa_end = "h2. ================================================================="

	repo_table = generate_repo_table(repos)
	return """
"""+repo_table+"""


"""+'[Crucible Review|'+crucible_url+'/cru/'+crucible_id+"""]


"""+qa_begin+"""

"""+qa_steps+"""

"""+qa_end+"""
"""


def generate_repo_table(repos):
	'''generates the repos table for a Jira comment geiven an array of repos

	Args:
		repos (Array<dict>) an array of repo dicts with: 
			baseBranch (str) the branch you branched from
			repositoryName (str) the repo name
			reviewedBranch (str) the branch to review

	Returns:
		string of a Jira comment table of repos
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

def diff_ticket(self, jira_ticket, sql_ticket):

	jira_ticket['key'] == sql_ticket.key
	jira_ticket['msrp'] == sql_ticket.msrp
	jira_ticket['summary'] == sql_ticket.summary
	jira_ticket['username'] == sql_ticket.username
	jira_ticket['component'] == sql_ticket.component
	jira_ticket['status'] == sql_ticket.status
	jira_ticket['story_point'] == sql_ticket.story_point
	jira_ticket['sprint'] == sql_ticket.sprint
	jira_ticket['label'] == sql_ticket.label
	jira_ticket['qa_steps'] == sql_ticket.qa_steps
	jira_ticket['severity'] == sql_ticket.severity