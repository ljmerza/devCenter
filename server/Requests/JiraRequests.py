#!/usr/bin/python3
import os

from ..FlaskUtils import missing_parameters
from ..ServerUtils import build_commit_message, get_branch_name
from ..Jira.Jira import Jira
from ..CodeCloud.CodeCloud import CodeCloud

def set_status(data):
	'''sets a Jira ticket's status
	'''
	if missing_parameters(params=data, required=['cred_hash','key','status_type']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	
	jira = Jira()

	if data['status_type'] == 'inDev':
		return jira.set_in_dev(key=data['key'], cred_hash=data['cred_hash'])

	if data['status_type'] == 'pcrNeeded':
		return jira.set_pcr_needed(key=data['key'], cred_hash=data['cred_hash'])
	if data['status_type'] == 'removePcrNeeded':
		return jira.remove_pcr_needed(key=data['key'], cred_hash=data['cred_hash'])
	if data['status_type'] == 'pcrWorking':
		return jira.set_pcr_working(key=data['key'], cred_hash=data['cred_hash'])
	if data['status_type'] == 'removePcrWorking':
		return jira.remove_pcr_working(key=data['key'], cred_hash=data['cred_hash'])
	if data['status_type'] == 'pcrCompleted':
		return jira.set_pcr_complete(key=data['key'], cred_hash=data['cred_hash'])
	if data['status_type'] == 'removePcrCompleted':
		return jira.remove_pcr_complete(key=data['key'], cred_hash=data['cred_hash'])

	if data['status_type'] == 'cr':
		return jira.set_code_review(key=data['key'], cred_hash=data['cred_hash'])

	elif data['status_type'] == 'qaReady':
		response = {'status': True, 'data': {}}
		response['data']['qa_ready_response'] = jira.set_ready_for_qa(key=data['key'], cred_hash=data['cred_hash'])
		response['data']['comment_response'] = jira.add_comment(key=data['key'], cred_hash=data['cred_hash'], comment='CR Pass')

	elif data['status_type'] == 'inQa':
		return jira.set_in_qa(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'qaFail':
		return jira.set_qa_fail(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'qaPass':
		response = {'status': True, 'data': {}}
		response['data']['qa_pass'] = jira.set_qa_pass(key=data['key'], cred_hash=data['cred_hash'])
		response['data']['merge_code'] = jira.set_merge_code(key=data['key'], cred_hash=data['cred_hash'])
		response['data']['comment_response'] = jira.add_comment(key=data['key'], cred_hash=data['cred_hash'], 
																	comment='QA Pass')
		return response

	elif data['status_type'] == 'mergeCode':
		return jira.set_merge_code(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'mergeConflict':
		return jira.set_merge_conflict(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'removeMergeConflict':
		return jira.remove_merge_conflict(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'uctReady':
		return jira.remove_merge_code(key=data['key'], cred_hash=data['cred_hash'])

	elif data['status_type'] == 'inUct':
		return jira.set_in_uct(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'uctPass':
		return jira.set_uct_pass(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'uctFail':
		return jira.set_uct_fail(key=data['key'], cred_hash=data['cred_hash'])
	else:
		return {"status": False, "data": 'Invalid status type'}

def add_qa_comment(data, pull_response=None):
	'''add a QA steps generated Jira comment 
	'''
	if missing_parameters(params=data, required=['key','repos', 'qa_steps', 'cred_hash']):
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

def add_comment(data):
	'''Add a Jira comment to a ticket
	'''
	if missing_parameters(params=data, required=['key', 'cred_hash', 'comment']):
		return {"data": missing_params, "status": False}

	response = Jira().add_comment(
		key=data["key"], 
		comment=data["comment"], 
		cred_hash=data['cred_hash']
	)
	return response

def add_commit_comment(data):
	'''add a Jira comment with the list of commited branches related to this ticket
	'''
	if missing_parameters(params=data, required=['key', 'cred_hash', 'master_branch']):
		return {"data": missing_params, "status": False}

	commit_response = CodeCloud().get_commit_ids(key=data['key'], master_branch=data['master_branch'], cred_hash=data['cred_hash'])
	if not commit_response['status']:
		return {"data": commit_response['data'], "status": False}

	comment = 'The following branches have been committed:\n || Repo || Branch || SHA-1 ||\n'
	for commit in commit_response.get('data', []):
		repo_name = commit.get('repo_name')
		master_branch = commit.get('master_branch')
		commit_id = commit.get('commit_id')
		comment += f"| {repo_name} | {master_branch} | {commit_id} |\n"

	return Jira().add_comment(
		key=data["key"], 
		comment=comment, 
		cred_hash=data['cred_hash']
	)

def edit_comment(data):
	'''Edits a Jira comment
	'''
	if missing_parameters(params=data, required=['key', 'cred_hash', 'comment_id', 'comment']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().edit_comment(
		key=data["key"], 
		comment=data["comment"], 
		cred_hash=data['cred_hash'],
		comment_id=data['comment_id']
	)

def delete_comment(data):
	'''deletes a jira comment
	'''
	if missing_parameters(params=data, required=['key', 'cred_hash', 'comment_id']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().delete_comment(
		key=data["key"], 
		cred_hash=data['cred_hash'],
		comment_id=data['comment_id']
	)

def add_work_log(data):
	'''add work time to a ticket
	'''
	if missing_parameters(params=data, required=['key', 'log_time', 'cred_hash']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().add_work_log(key=data["key"], time=data['log_time'], cred_hash=data['cred_hash'])

def get_jira_tickets(data):
	'''gets all jira tickets by given filter number or JQL
	'''
	if missing_parameters(params=data, required=['cred_hash']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
		
	filter_number = data.get('filter_number', False)
	jql = data.get('jql', False)
	if not filter_number and not jql:
		return {"data": "A filter number or JQL is required", "status": False}

	jira_data = Jira().get_jira_tickets(
		filter_number=filter_number, 
		cred_hash=data['cred_hash'], 
		fields=data['fields'], 
		jql=data['jql']
	)

	if not jira_data['status']:
		return {'status': False, 'data': f'Could not get Jira tickets for filter number {filter_number}: '+jira_data['data'] }

	for ticket in jira_data['data']:
		ticket['commit'] = build_commit_message(ticket['key'], ticket['msrp'], ticket['summary']) 
		ticket['branch'] = get_branch_name(ticket['username'], ticket['msrp'], ticket['summary'])

	return jira_data

def find_key_by_msrp(data):
	'''find a Jira key by it's MSRP
	'''
	if missing_parameters(params=data, required=['cred_hash','msrp']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().find_key_by_msrp(msrp=data['msrp'], cred_hash=data['cred_hash'])

def get_profile(data):
	'''get a Jira user's profile data
	'''
	if missing_parameters(params=data, required=['username', 'cred_hash']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	jira_response = Jira().get_profile(cred_hash=data['cred_hash'])
	if not jira_response['status']:
		return {'status': False, 'data': f'Could not get user profile:'+ jira_response.get('data', '') }

	jira_response['data']['is_admin'] = os.environ['USER'] == data['username']
	return jira_response

def parse_comment(data):
	'''parse out a Jira comment
	'''
	if missing_parameters(params=data, required=['cred_hash', 'comment', 'key']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().parse_comment(cred_hash=data['cred_hash'], comment=data['comment'], key=data['key'])

def modify_watchers(data):
	'''add, remove, or get all Jira ticket watchers
	'''
	if missing_parameters(params=data, required=['type_of_modify', 'key']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	type_of_modify = data.get('type_of_modify', '')

	if type_of_modify in ['add','remove']:
		if missing_parameters(params=data, required=['username']):
			return {"data": f"Missing required parameters: {missing_params}", "status": False}
		
	jira = Jira()
	if type_of_modify == 'add':
		return jira.add_watcher(username=data['username'], cred_hash=data['cred_hash'], key=data['key'])

	elif type_of_modify == 'remove':
		return jira.remove_watcher(username=data['username'], cred_hash=data['cred_hash'], key=data['key'])

	elif type_of_modify == 'get':
		return jira.get_watchers(cred_hash=data['cred_hash'], key=data['key'])

	return {
		'status': False,
		'data': f'Invalid type of watcher modify: {type_of_modify}'
	}