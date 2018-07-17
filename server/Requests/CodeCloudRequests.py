#!/usr/bin/python3

from ..FlaskUtils import missing_parameters
from ..CodeCloud.CodeCloud import CodeCloud
from ..Jira.Jira import Jira

def create_review(data):
	'''
	'''
	if missing_parameters(params=data, required=['cred_hash', 'msrp']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	response = {'status': True, 'data':{}}
	comment_response = {'status': False}
	log_response = {'status': False}
	cr_response = {'status': False}
	pcr_response = {'status': False}
	pull_response = {'status': False}

	jira = Jira()
	codeCloud = CodeCloud()

	ticket_data = jira.find_qa_title_data(msrp=data['msrp'], cred_hash=data['cred_hash'])
	if not ticket_data['status']:
		return ticket_data

	# if repos given then create crucible
	if len(data['repos']):

		# if data['autoPCR']:
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

	# if data['autoPCR']:
	# 	data['status_type'] = 'pcrNeeded'
	# 	pcr_response = set_status(data=data)
	# 	data['status_type'] = 'cr'
	# 	cr_response = set_status(data=data)

	# if data['log_time']:
	# 	log_response = add_work_log(data=data)

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
	if missing_parameters(params=data, required=['cred_hash', 'repo_name']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return CodeCloud().get_branches(cred_hash=data['cred_hash'], repo_name=data['repo_name'])

def ticket_branches(data):
	'''gets a branches related to a Jira ticket
	'''
	if missing_parameters(params=data, required=['cred_hash', 'msrp']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return CodeCloud().ticket_branches(cred_hash=data['cred_hash'], msrp=data['msrp'])

def create_pull_requests(data):
	'''creates a pull request for a Jira ticket
	'''
	if missing_parameters(params=data, required=['cred_hash', 'repos', 'key', 'msrp', 'summary']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return CodeCloud().create_pull_requests(
		repos=data['repos'], key=data['key'],
		msrp=data['msrp'], cred_hash=data['cred_hash'],
		summary=data['summary']
	)

def add_reviewer():
	pass

def pass_review():
	pass
