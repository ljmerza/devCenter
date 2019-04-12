"""Handles CodeCloud requests."""
from devcenter.codecloud.codecloud import CodeCloud
from devcenter.jira.jira import Jira
from devcenter.requests.jira import set_status
from devcenter.server_utils import missing_parameters, verify_parameters


@verify_parameters('cred_hash msrp key')
def transition_to_pcr(data):
	"""Creates a bit bucket review and transitions Jira ticket to PCR Ready."""
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


@verify_parameters('summary repos key msrp cred_hash')
def create_pull_requests(data):
	"""Generate pull requests."""
	qa_title = Jira().build_qa_title(key=data['key'], msrp=data['msrp'], summary=data['summary'])
	return CodeCloud().create_pull_requests(
		repos=data['repos'], 
		key=data['key'],
		qa_title=qa_title,
		msrp=data['msrp'],
		cred_hash=data['cred_hash'],
		summary=data['summary']
	)


@verify_parameters('cred_hash repo_name')
def get_branches(data):
	"""Gets all branches for a given repo."""
	return CodeCloud().get_branches(cred_hash=data['cred_hash'], repo_name=data['repo_name'])


@verify_parameters('cred_hash msrp')
def ticket_branches(data):
	"""Gets a branches related to a Jira ticket."""
	return CodeCloud().ticket_branches(cred_hash=data['cred_hash'], msrp=data['msrp'])


@verify_parameters('key repos qa_steps cred_hash')
def add_qa_comment(data, pull_response=None):
	"""Add a QA steps generated Jira comment."""
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


@verify_parameters('pull_request_id repo_name username cred_hash')
def add_reviewer_to_pull_request(data):
	"""Adds a reviewer to a pull request."""
	return CodeCloud().add_reviewer_to_pull_request(
		username=data['username'], 
		repo_name=data['repo_name'], 
		pull_request_id=data['pull_request_id'], 
		cred_hash=data['cred_hash']
	)