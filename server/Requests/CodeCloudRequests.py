#!/usr/bin/python3

from ..FlaskUtils import missing_parameters
from ..CodeCloud.CodeCloud import CodeCloud
from ..Jira.Jira import Jira

from ..Requests.JiraRequests import set_status

def transition_to_pcr(data):
	'''creates a bit bucket review
	'''
	missing_params =missing_parameters(params=data, required=['cred_hash', 'msrp', 'key'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	response = {'status': True, 'data':{}}
	pull_response = {'status': False}
	comment_response = {'status': False}
	pcr_response = {'status': False}
	cr_response = {'status': False}
	dev_change_response = {'status': False}
	log_response = {'status': False}
	diff_response = {'status': False}
	
	# if repos given and transitioning to PCR then create pull requests
	# else if only have repos then we just want diff links
	if len(data['repos']) and data['autoPCR'] and not data['skip_pulls']:
		pull_response = create_pull_requests(data)
	if len(data['repos']):
		diff_response = CodeCloud().generate_diff_links(repos=data['repos'], master_branch=data['master_branch'])

	if data['qa_steps']:
		comment_response = add_qa_comment(data=data, pull_response=pull_response, diff_response=diff_response)

	# if transitioning to PCR then update Jira ticket statuses and add dev changes text
	if data['autoPCR']:
		auto_pcr_response = auto_pcr(data=data, pull_response=pull_response)
		pcr_response = auto_pcr_response['pcr_response']
		cr_response = auto_pcr_response['cr_response']
		dev_change_response = auto_pcr_response['dev_change_response']

	if data['log_time']:
		log_response = Jira().add_work_log(time=data['log_time'], key=data['key'], cred_hash=data['cred_hash'])

	# save all response and return
	response['data']['comment_response'] = comment_response
	response['data']['dev_change_response'] = dev_change_response
	response['data']['log_response'] = log_response
	response['data']['cr_response'] = cr_response
	response['data']['pcr_response'] = pcr_response
	response['data']['pull_response'] = pull_response
	response['data']['diff_response'] = diff_response
	return response

def get_repos(data):
	'''get a list of all current repos'''
	return CodeCloud().get_repos()

def create_pull_requests(data):
	'''generate pull requests
	'''
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

def auto_pcr(data, pull_response):
	''' transition Jira ticket and add dev changes text from pull request data
	'''
	jira = Jira()

	response = {'status': False}
	data['status_type'] = 'pcrNeeded'
	pcr_response = set_status(data=data)

	data['status_type'] = 'cr'
	cr_response = set_status(data=data)

	# add pull request info to dev changes tab
	dev_change_response = {'status': False, 'data': ''}
	if pull_response['status']:
		missing_params = missing_parameters(params=data, required=['story_point'])
		if missing_params:
			return {"data": f"Missing required parameters: {missing_params}", "status": False}
		dev_change_response = jira.add_pr_to_dev_changes(pull_response=pull_response, data=data)

	return {
		'pcr_response': pcr_response,
		'cr_response': cr_response,
		'dev_change_response': dev_change_response
	}

def get_branches(data):
	'''gets all branches for a given repo
	'''
	missing_params = missing_parameters(params=data, required=['cred_hash', 'repo_name'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return CodeCloud().get_branches(cred_hash=data['cred_hash'], repo_name=data['repo_name'])

def ticket_branches(data):
	'''gets a branches related to a Jira ticket
	'''
	missing_params = missing_parameters(params=data, required=['cred_hash', 'msrp'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return CodeCloud().ticket_branches(cred_hash=data['cred_hash'], msrp=data['msrp'])


def add_qa_comment(data, pull_response=None, diff_response=None):
	'''add a QA steps generated Jira comment 
	'''
	missing_params = missing_parameters(params=data, required=['key','repos', 'qa_steps', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	qa_step_comment = CodeCloud().generate_qa_template(
		qa_steps=data['qa_steps'], 
		repos=data['repos'], 
		pull_response=pull_response, 
		diff_response=diff_response, 
	)

	return Jira().add_comment(
		key=data['key'], 
		cred_hash=data['cred_hash'], 
		comment=qa_step_comment
	)
	
def pass_review_for_pull_requests(data):
	missing_params = missing_parameters(params=data, required=['pull_requests', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	comment = 'PCR Pass'
	responses = {'status': True, 'data': []}

	for pull_request in data['pull_requests']:
		add_response = CodeCloud().add_comment_to_pull_request(
			repo_name=pull_request['repo'], 
			pull_request_id=pull_request['requestId'], 
			comment=comment, 
			cred_hash=data['cred_hash']
		)

		# add response from adding pass comment and check errors
		responses['data'].append(add_response)
		if not add_response['status']:
			responses['status'] = False

	return responses

def add_reviewer_to_pull_request(data):
	missing_params = missing_parameters(params=data, required=['pull_request_id', 'repo_name', 'username', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return CodeCloud().add_reviewer_to_pull_request(
		username=data['username'], 
		repo_name=data['repo_name'], 
		pull_request_id=data['pull_request_id'], 
		cred_hash=data['cred_hash']
	)

