#!/usr/bin/python3

from ..FlaskUtils import missing_parameters
from ..Jira.Jira import Jira
from ..CodeCloud.CodeCloud import CodeCloud

def pcr_complete_transition(data):
	missing_params = missing_parameters(params=data, required=['cred_hash','username'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	response = {'status': True, 'data': {}}
	response['data']['set_pcr_complete'] =  Jira().set_pcr_complete(key=data['key'], cred_hash=data['cred_hash'])
	
	if(data.get('pull_requests', False)):
		response = _pass_pull_requests(data=data, response=response, comment='PCR Complete')

	return response

def pcr_pass_transition(data):
	missing_params = missing_parameters(params=data, required=['cred_hash', 'username'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	response = {'status': True, 'data': {'add_comment': []}}
	response['data']['set_pcr_needed'] = Jira().set_pcr_needed(key=data['key'], cred_hash=data['cred_hash'])

	if(data.get('pull_requests', False)):
		response = _pass_pull_requests(data=data, response=response, comment='PCR Pass')

	return response

def _pass_pull_requests(data, response, comment):
	'''add'''
	cc = CodeCloud()
	response['data']['add_comment'] = []
	response['data']['pass_response'] = []

	for pull_request in data['pull_requests']:
		pull_response = cc.add_comment_to_pull_request(
			repo_name=pull_request['repo'], 
			pull_request_id=pull_request['requestId'], 
			comment=comment, 
			cred_hash=data['cred_hash']
		)

		pass_response = cc.pass_pull_request_review(
			username=data['username'], 
			repo_name=pull_request['repo'], 
			pull_request_id=pull_request['requestId'], 
			cred_hash=data['cred_hash']
		)

		response['data']['add_comment'].append(pull_response) 
		response['data']['pass_response'].append(pass_response) 

	return response

def pcr_working_transition(data):
	missing_params = missing_parameters(params=data, required=['username'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	response = {'status': True, 'data': {'add_reviewer':[]}}
	response['data']['set_pcr_working'] = Jira().set_pcr_working(key=data['key'], cred_hash=data['cred_hash'])

	cc = CodeCloud()
	for request in data.get('pull_requests', []):
		pull_response = cc.add_reviewer_to_pull_request(
			username=data['username'], 
			repo_name=request['repo'], 
			pull_request_id=request['requestId'], 
			cred_hash=data['cred_hash']
		)
		response['data']['add_reviewer'].append(pull_response)
	
	return response

def qa_ready_transition(data):
	''''''
	response = {'status': True, 'data': {}}
	jira = Jira()

	response['data']['qa_ready_response'] = jira.set_ready_for_qa(key=data['key'], cred_hash=data['cred_hash'])
	response['data']['comment_response'] = jira.add_comment(key=data['key'], cred_hash=data['cred_hash'], comment='CR Pass')

	return response

def qa_pass_transition(data):
	''''''
	response = {'status': True, 'data': {}}
	jira = Jira()

	response['data']['qa_pass'] = jira.set_qa_pass(key=data['key'], cred_hash=data['cred_hash'])
	response['data']['merge_code'] = jira.set_merge_code(key=data['key'], cred_hash=data['cred_hash'])
	response['data']['comment_response'] = jira.add_comment(key=data['key'], cred_hash=data['cred_hash'], comment='QA Pass')

	return response

def uct_ready_transition(data):
	''''''
	response = {'status': True, 'data': {}}
	response['data']['uct_pass'] = Jira().remove_merge_code(key=data['key'], cred_hash=data['cred_hash'])

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
	'''add a Jira comment with the list of committed branches related to this ticket
	'''
	comment = 'The following branches have been committed:\n || Repo || Branch || SHA-1 ||\n'
	for commit in commit_ids.get('data', []):
		repo_name = commit.get('repo_name')
		master_branch = commit.get('master_branch')
		commit_id = commit.get('commit_id')
		comment += f"| {repo_name} | {master_branch} | {commit_id} |\n"

	return Jira().add_comment(
		key=key, 
		comment=comment, 
		cred_hash=cred_hash
	)