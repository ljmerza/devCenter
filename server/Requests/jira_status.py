#!/usr/bin/python3

from ..FlaskUtils import missing_parameters
from ..Jira.Jira import Jira
from ..CodeCloud.CodeCloud import CodeCloud

def pcr_complete_transition(data):
	missing_params = missing_parameters(params=data, required=['repo_name','pull_request_id','username','comment'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	jira = Jira()
	cc = CodeCloud()

	response = {'status': True, 'data': {}}
	response['data']['remove_pcr_working'] = jira.remove_pcr_working(key=data['key'], cred_hash=data['cred_hash'])
	response['data']['set_pcr_complete'] =  jira.set_pcr_complete(key=data['key'], cred_hash=data['cred_hash'])
	response['data']['pass_pull_request_review'] = cc.pass_pull_request_review(
		username=data['username'], 
		repo_name=data['repo_name'], 
		pull_request_id=data['pull_request_id'], 
		cred_hash=data['cred_hash']
	)
	response['data']['add_comment_to_pull_request'] = cc.add_comment_to_pull_request(
		username=data['username'], 
		repo_name=data['repo_name'], 
		pull_request_id=data['pull_request_id'], 
		cred_hash=data['cred_hash'],
		comment='PCR Pass'
	)

	return response

def pcr_pass_transition(data):
	missing_params = missing_parameters(params=data, required=['repo_name','pull_request_id','username'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	jira = Jira()
	cc = CodeCloud()

	response = {'status': True, 'data': {}}
	response['data']['remove_pcr_working'] = jira.remove_pcr_working(key=data['key'], cred_hash=data['cred_hash'])
	response['data']['pass_pull_request_review'] = cc.pass_pull_request_review(
		username=data['username'], 
		repo_name=data['repo_name'], 
		pull_request_id=data['pull_request_id'], 
		cred_hash=data['cred_hash']
	)
	return response

def pcr_working_transition(data):
	missing_params = missing_parameters(params=data, required=['pull_requests','username'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	cc = CodeCloud()
	jira = Jira()

	# pcr working - convert status to pcr working, add as reviewer to pull request, add dev changes username as reviewer
	response = {'status': True, 'data': {}}

	response['data']['set_pcr_working'] = jira.set_pcr_working(key=data['key'], cred_hash=data['cred_hash'])

	response['data']['add_reviewer_to_pull_request'] = []
	for request in data['pull_requests']:
		cc_response = cc.add_reviewer_to_pull_request(
			username=data['username'], 
			repo_name=request['repo'], 
			pull_request_id=request['requestId'], 
			cred_hash=data['cred_hash']
		)
		
		response['data']['add_reviewer_to_pull_request'].append(cc_response)

	if data['dev_changes']:
		dev_changes = data['dev_changes'] + f'\n{[username] - PCR}'
		response['data']['add_dev_changes'] = jira.add_dev_changes(dev_changes=dev_changes, cred_hash=data['cred_hash'], key=data['key'])
	
	return response
