import base64
import re
import os


DC_USER = os.environ.get('DC_USER', '')
PASSWORD = os.environ.get('PASSWORD', '')


def generate_cred_hash(username='', password=''):
	"""Generates the global cred hash."""
	username = username if username else DC_USER
	password = password ifpassword else  PASSWORD
	encoded_header_value = f'{username}:{password}'.encode()
	encoded_header = base64.b64encode(encoded_header_value).decode('ascii')
	return f'Basic {encoded_header}'


def row2dict(row):
	"""converts sql data to a dictionary."""
	d = {}
	for column in row.__table__.columns:
		d[column.name] = str(getattr(row, column.name))
	return d


def get_branch_name(username='', msrp='', summary=''):
	"""Creates a branch name."""

	if summary:
		branch = re.sub(r'[^\x00-\x7F]+','', summary)
		branch = re.sub(r" +", '-', branch)
		branch = re.sub(r"\"", '', branch)
		branch = re.sub(r"\'", '', branch)
		branch = re.sub(r"-+", '-', branch)

		# if summary starts/ends with a dash then get rid of it
		if branch.startswith('-'):
			branch = branch[1:]
		if branch.endswith('-'):
			branch = branch[:-1]
	else:
		branch = ''

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

	if summary:
		summary = re.sub(r"\"", '', summary)
		summary = re.sub(r"\'", '', summary)
		commit += f" {summary}"

	return commit


def missing_parameters(params=None, required=None, one_required=None):
	"""Checks for missing parameters."""
	missing = ''
	params = [] if params is None else params
	required = [] if required is None else required
	one_required = [] if one_required is None else one_required

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