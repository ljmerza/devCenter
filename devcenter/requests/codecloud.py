from devcenter.server_utils import missing_parameters
from devcenter.codecloud.codecloud import CodeCloud
from devcenter.jira.jira import Jira
from .jira import set_status


def transition_to_pcr(data):
	"""Creates a bit bucket review and transitions Jira ticket to PCR Ready.
		Possible responses: 
			pull_response, dev_change_response, qa_comment_response, qa_info_response, log_response
			from set_status:
				pr_add_response, status_response, comment_response, new_response
					commit_ids, commit_comment (from add_commits_table_comment)
	"""
	missing_params = missing_parameters(params=data, required=['cred_hash', 'msrp', 'key'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	jira = Jira()
	response = {'status': True, 'data': {}}
	
	# if repos given and transitioning to PCR then create pull requests
	if len(data['repos']) and not data['skip_pulls']:
		response['data']['pull_response'] = create_pull_requests(data)
		missing_params = missing_parameters(params=data, required=['story_point'])
		if missing_params:
			response['data']['dev_change_response'] = {"data": f"Missing required parameters: {missing_params}", "status": False}
		else:
			response['data']['dev_change_response'] = jira.add_pr_to_dev_changes(pull_response=response['data']['pull_response'], data=data)

	if data['qa_steps']:
		response['data']['qa_comment_response'] = add_qa_comment(data=data, pull_response=response['data'].get('pull_response'))
		response['data']['qa_info_response'] = jira.set_additional_qa(comment=data['qa_steps'], key=data['key'], cred_hash=data['cred_hash'])

	if data['log_time']:
		response['data']['log_response'] = jira.add_work_log(time=data['log_time'], key=data['key'], cred_hash=data['cred_hash'])

	data['status'] = {'name': 'PCR Ready', 'id': 451}
	status_response = set_status(data=data)
	response['data'] = {**response['data'], **status_response['data']}

	return response 


def get_repos(data):
	"""Get a list of all current repos."""
	return CodeCloud().get_repos()


def create_pull_requests(data):
	"""Generate pull requests."""
	missing_params = missing_parameters(params=data, required=['summary','repos'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# generate pull request title and then generate all pull requests
	qa_title = Jira().build_qa_title(key=data['key'], msrp=data['msrp'], summary=data['summary'])

	return CodeCloud().create_pull_requests(
		repos=data['repos'], 
		key=data['key'],
		qa_title=qa_title,
		msrp=data['msrp'],
		cred_hash=data['cred_hash'],
		summary=data['summary']
	)


def get_branches(data):
	"""Gets all branches for a given repo."""
	missing_params = missing_parameters(params=data, required=['cred_hash', 'repo_name'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return CodeCloud().get_branches(cred_hash=data['cred_hash'], repo_name=data['repo_name'])


def ticket_branches(data):
	"""Gets a branches related to a Jira ticket."""
	missing_params = missing_parameters(params=data, required=['cred_hash', 'msrp'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return CodeCloud().ticket_branches(cred_hash=data['cred_hash'], msrp=data['msrp'])


def add_qa_comment(data, pull_response=None):
	"""Add a QA steps generated Jira comment."""
	missing_params = missing_parameters(params=data, required=['key','repos', 'qa_steps', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	qa_step_comment = CodeCloud().generate_qa_template(
		qa_steps=data['qa_steps'], 
		repos=data['repos'], 
		pull_response=pull_response,
	)

	return Jira().add_comment(
		key=data['key'], 
		cred_hash=data['cred_hash'], 
		comment=qa_step_comment,
		private_comment=True
	)


def add_reviewer_to_pull_request(data):
	"""Adds a reviewer to a pull request."""
	missing_params = missing_parameters(params=data, required=['pull_request_id', 'repo_name', 'username', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return CodeCloud().add_reviewer_to_pull_request(
		username=data['username'], 
		repo_name=data['repo_name'], 
		pull_request_id=data['pull_request_id'], 
		cred_hash=data['cred_hash']
	)