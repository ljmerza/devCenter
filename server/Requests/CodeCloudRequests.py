#!/usr/bin/python3

from ..FlaskUtils import missing_parameters
from ..CodeCloud.CodeCloud import CodeCloud
from ..Jira.Jira import Jira

def create_review(data):
	'''
	'''
	missing_params =missing_parameters(params=data, required=['cred_hash', 'msrp', 'key', 'summary'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	response = {'status': True, 'data':{}}
	comment_response = {'status': False}
	log_response = {'status': False}
	cr_response = {'status': False}
	pcr_response = {'status': False}
	pull_response = {'status': False}

	jira = Jira()
	codeCloud = CodeCloud()

	data['qa_title'] = jira.build_qa_title(key=data['key'], msrp=data['msrp'], summary=data['summary'])

	# if repos given then create crucible
	if len(data['repos']):

		pull_response = create_pull_requests(data=data)
		if not pull_response['status']:
			return pull_response

		# add pull request info to dev changes tab
		if pull_response['status']:
			dev_change_response = jira.add_dev_changes(pull_response=pull_response, data=data)
			if not dev_change_response['status']:
				return dev_change_response

		if data['qa_steps']:
			comment_response = add_qa_comment(data=data, pull_response=pull_response)

	elif data['qa_steps']:
		data['comment'] = data['qa_steps']
		comment_response = add_comment(data=data)

	if data['autoPCR']:
		data['status_type'] = 'pcrNeeded'
		pcr_response = set_status(data=data)
		data['status_type'] = 'cr'
		cr_response = set_status(data=data)

	if data['log_time']:
		log_response = add_work_log(data=data)

	response['data']['comment_response'] = comment_response
	response['data']['log_response'] = log_response
	response['data']['cr_response'] = cr_response
	response['data']['pcr_response'] = pcr_response
	response['data']['pull_response'] = pull_response

	return response

def get_repos(data):
	'''get a list of all current repos'''
	return CodeCloud().get_repos()

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

def create_pull_requests(data):
	'''creates a pull request for a Jira ticket
	'''
	missing_params = missing_parameters(params=data, required=['cred_hash', 'repos', 'key', 'msrp', 'summary', 'qa_title'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return CodeCloud().create_pull_requests(
		repos=data['repos'], 
		key=data['key'],
		qa_title=data['qa_title'],
		msrp=data['msrp'], 
		cred_hash=data['cred_hash'],
		summary=data['summary']
	)


def add_qa_comment(data, pull_response=None):
	'''add a QA steps generated Jira comment 
	'''
	missing_params = missing_parameters(params=data, required=['key','repos', 'qa_steps', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# if given pull requests then add to QA comment
	pull_request_comments = ''
	if pull_response:
		pull_request_comments = CodeCloud().generate_pull_request_comment(
			pull_response=pull_response,
			repos=data.get('repos', []),
		)

	qa_steps = Jira().generate_qa_template(
		qa_steps=data['qa_steps'], 
		repos=data['repos'], 
		pull_request_comments=pull_request_comments, 
	)

	data['comment'] = qa_steps
	return add_comment(data=data)
	
def pass_review_for_pull_requests(data):
	missing_params = missing_parameters(params=data, required=['pull_requests', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	comment = 'PCR Pass'
	responses = {'status': True, data: []}

	for pull_request in data['pull_requests']:
		add_response = CodeCloud().add_comment_to_pull_request(
			repo_name=pull_request['repo'], 
			pull_request_id=pull_request['requestId'], 
			comment=comment, 
			cred_hash=data['cred_hash']
		)

		print(add_response)

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

