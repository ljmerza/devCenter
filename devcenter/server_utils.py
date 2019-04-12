from base64 import b64encode
from re import sub
from os import environ


DC_USER = environ.get('DC_USER', '')
PASSWORD = environ.get('PASSWORD', '')


def generate_cred_hash(username='', password=''):
	"""Generates the global cred hash."""
	username = username if username else DC_USER
	password = password if password else PASSWORD
	encoded_header_value = f'{username}:{password}'.encode()
	encoded_header = b64encode(encoded_header_value).decode('ascii')
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
		branch = sub(r'[^\x00-\x7F]+','', summary)
		branch = sub(r" +", '-', branch)
		branch = sub(r"\"", '', branch)
		branch = sub(r"\'", '', branch)
		branch = sub(r"-+", '-', branch)

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
		summary = sub(r"\"", '', summary)
		summary = sub(r"\'", '', summary)
		commit += f" {summary}"

	return commit


def verify_parameters(function, required=''):
	"""Decorator to verifiy passed in arguments."""
	required = required.split(' ')
    def return_result(data):
		missing_params = missing_parameters(params=data, required=required)
		if missing_params:
			return {"data": f"${function.__name__} is missing required parameters: {missing_params}", "status": False}
        else:
            return function(data)
    return return_result


def missing_parameters(params=None, required=None):
	"""Checks for missing parameters."""
	params = [] if params is None else params
	required = [] if required is None else required

	# get any missing required keys
	missing_keys = [x for x in required if not params.get(x)]
	if missing_keys:
		return 'Missing the following required args: ' + ', '.join(missing_keys)