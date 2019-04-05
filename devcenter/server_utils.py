import re
import os

trantab = "".maketrans(",!.;:/\\()@#$%^&*[]'<>|~`", "------------------------")


def row2dict(row):
	"""converts data to a dictionary."""
	d = {}
	for column in row.__table__.columns:
		d[column.name] = str(getattr(row, column.name))
	return d


def get_branch_name(username='', msrp='', summary=''):
	"""Creates a branch name."""
	branch = summary.translate(trantab)
	branch = re.sub(r" +", '-', branch)
	branch = re.sub(r"\"", '', branch)
	branch = re.sub(r"\'", '', branch)
	branch = re.sub(r"-+", '-', branch)

	# if summary starts/ends with a dash then get rid of it
	if branch.startswith('-'):
		branch = branch[1:]
	if branch.endswith('-'):
		branch = branch[:-1]

	branch = '' if branch is None else branch

	# create branch name and make sure over 30 chars
	branch_name = f"{username}-{msrp}-{branch}"
	if len(branch_name) < 30:
		while len(branch_name) < 30:
			branch_name += f'-{msrp}'

	return branch_name


def build_commit_message(key='', msrp='', summary='', epic_link=''):
	"""Creates a commit message for a Jira ticket."""
	commit = f"[{key}] Ticket #{msrp}" 

	if epic_link:
		commit +=f" - {epic_link} -"

	summary = re.sub(r"\"", '', summary)
	summary = re.sub(r"\'", '', summary)
	commit += f" {summary}"
	return commit


def missing_parameters(params=None, required=None, one_required=None):
	"""Checks for mnissing parameters."""
	missing = ''
	params = params if params is None else []
	required = required if required is None else []
	one_required = one_required if one_required is None else []

	# get any missing required keys
	missing_keys = [x for x in required if not params.get(x)]
	if missing_keys:
		missing = 'Missing the following required args: ' + ', '.join(missing_keys)

	# see if at least one key is given
	if one_required:
		one_key_needed = [x for x in one_required if not params.get(x)]

		if len(one_key_needed) == len(one_required):
			if missing:
				missing += ', and at least one of the following optional args: '
			else: 
				missing = 'Missing at least one of the following optional args: '
			missing += ', '.join(one_required)

	return missing