import os
import re

qa_begin = "h3. ==== QA Steps ===="
qa_end = "h3. ==============="

def generate_qa_template(qa_steps, repos, pull_request_comments=''):
	repo_table = generate_repo_table(repos)
	
	return """
"""+repo_table"""

"""+pull_request_comments"""

"""+qa_begin+"""

"""+qa_steps+"""

"""+qa_end+"""
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