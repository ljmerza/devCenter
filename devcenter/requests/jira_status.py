"""Jira status change based actions."""
from devcenter.server_utils import missing_parameters
from devcenter.jira.jira import Jira
from devcenter.codecloud.codecloud import CodeCloud


def pass_pull_requests(data):
	"""Pass all pull request objects given."""
	missing_params = missing_parameters(params=data, required=['pull_requests'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	code_cloud = CodeCloud()
	response = {'status': True, 'data': []}

	for pull_request in data['pull_requests']:
		pass_response = code_cloud.pass_pull_request_review(
			username=data['username'], 
			repo_name=pull_request['repo'], 
			pull_request_id=pull_request['requestId'], 
			cred_hash=data['cred_hash']
		)

		if not pass_response['status']:
			response['status'] = False

		response['data'].append(pass_response) 

	return response


def add_reviewer_all_pull_requests(data):
	"""Adds as reviews to all given pull requests."""
	missing_params = missing_parameters(params=data, required=['username'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	code_cloud = CodeCloud()
	responses = {'status': True, 'data': []}

	for request in data.get('pull_requests', []):
		pull_response = code_cloud.add_reviewer_to_pull_request(
			username=data['username'], 
			repo_name=request['repo'], 
			pull_request_id=request['requestId'], 
			cred_hash=data['cred_hash']
		)

		if not pull_response['status']:
			responses['status'] = False

		responses['data'].append(pull_response)
	
	return responses


def add_cr_pass_comment(data):
	"""Adds CR pass comment to Jira Ticket."""
	return Jira().add_comment(
		key=data['key'], 
		cred_hash=data['cred_hash'], 
		comment='CR Pass',
		private_comment=True
	)


def add_qa_pass_comment(data):
	"""Add QA Pass comment."""
	return Jira().add_comment(
		key=data['key'], 
		cred_hash=data['cred_hash'], 
		comment='QA Pass',
		private_comment=True
	)


def add_commits_table_comment(data):
	"""Adds all commit ids to a jira comment.
		Possible responses: 
			commit_ids, commit_comment
	"""
	response = {'status': True, 'data': {}}

	if data.get('add_commits', False):
		missing_params = missing_parameters(params=data, required=['key', 'cred_hash', 'pull_requests', 'master_branch'])
		if missing_params:
			return {"data": missing_params, "status": False}

		commit_ids = CodeCloud().get_commit_ids(
			key=data['key'], 
			pull_requests=data['pull_requests'], 
			cred_hash=data['cred_hash'],
			master_branch=data['master_branch']
		)
		response['data']['commit_ids'] = commit_ids

		if commit_ids['status']:
			response['data']['commit_comment'] = _add_commit_comment(
				commit_ids=commit_ids,
				key=data['key'],
				cred_hash=data['cred_hash']
			)

	return response


def _add_commit_comment(commit_ids, key, cred_hash):
	"""Add a Jira comment with the list of committed branches related to this ticket."""
	comment = 'The following branches have been committed:\n || Repo || Branch || SHA-1 ||\n'
	for commit in commit_ids.get('data', []):
		repo_name = commit.get('repo_name')
		master_branch = commit.get('master_branch')
		commit_id = commit.get('commit_id')
		comment += f"| {repo_name} | {master_branch} | {commit_id} |\n"

	return Jira().add_comment(
		key=key, 
		comment=comment, 
		cred_hash=cred_hash,
		private_comment=True
	)