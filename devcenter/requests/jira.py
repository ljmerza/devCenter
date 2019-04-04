"""Processes all Jira Requesats."""
import os

from devcenter.server_utils import build_commit_message, get_branch_name, missing_parameters
from devcenter.jira.jira import Jira
from devcenter.codecloud.codecloud import CodeCloud
from .jira_status import (
	pass_pull_requests, add_reviewer_all_pull_requests, add_cr_pass_comment,
	add_qa_pass_comment, add_commits_table_comment
)


def set_status(data):
	"""Sets a Jira ticket's status.
		Possible responses: 
			pr_add_response, status_response, comment_response, new_response
			commit_ids, commit_comment (from add_commits_table_comment)
	"""
	missing_params = missing_parameters(params=data, required=['cred_hash','key','status'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	jira = Jira()
	response = {'status': True, 'data': {}}

	status_name = data.get('status', {}).get('name', '')
	status_id = data.get('status', {}).get('id', '')

	if data.get('is_removing_component', False):
		response['data']['status_response'] = jira.remove_component(name=data.get('original_status'), key=data['key'], cred_hash=data['cred_hash'])
	
	if data.get('is_adding_component', False):
		response['data']['status_response'] = jira.set_component(name=status_name, key=data['key'], cred_hash=data['cred_hash'])

	if status_id:
		response['data']['status_response'] = jira.set_status(key=data['key'], transition_id=status_id, cred_hash=data['cred_hash'])
	
	# do any special actions for certain status changes
	if status_name in ['In PCR', 'PCR - Working']:
		response['data']['pr_add_response'] = add_reviewer_all_pull_requests(data=data)
	elif status_name in ['PCR Pass', 'PCR - Needed']:
		response['data']['pr_pass_response'] = pass_pull_requests(data=data)
	elif status_name == 'CR Pass':
		response['data']['comment_response'] = add_cr_pass_comment(data)
	elif status_name == 'QA Pass':
		response['data']['comment_response'] = add_qa_pass_comment(data)
		jira.set_component(name='Merge Code', key=data['key'], cred_hash=data['cred_hash'])
	
	# add commits jira comment
	if data.get('add_commits', False):
		commit_response = add_commits_table_comment(data)
		response['data'] = { **response['data'], **commit_response['data'] }

	# get new status for ticket
	response['data']['new_response'] = get_new_component(key=data['key'], cred_hash=data['cred_hash'])
	return response


def get_new_component(key, cred_hash):
	"""Gets the new status for a ticket."""
	fields = 'components,status,transitions'
	new_ticket = Jira().get_ticket_field_values(key=key, cred_hash=cred_hash, fields=fields, get_expanded=True)
	if(not new_ticket['status']):
		return response

	return {
		'status': True,
		'data': {
			'component': new_ticket['data'].get('component', ''),
			'transitions': new_ticket['data'].get('transitions', []),
			'full_status': new_ticket['data'].get('full_status', {}),
			'status': new_ticket['data'].get('status', ''),
			'key': key
		}
	}


def add_comment(data):
	"""Add a Jira comment to a ticket."""
	missing_params = missing_parameters(params=data, required=['key', 'cred_hash', 'comment'])
	if missing_params:
		return {"data": missing_params, "status": False}

	response = Jira().add_comment(
		key=data["key"], 
		comment=data["comment"], 
		cred_hash=data['cred_hash'],
		private_comment=data.get('private_comment', True)
	)
	return response


def edit_comment(data):
	"""Edits a Jira comment."""
	missing_params = missing_parameters(params=data, required=['key', 'cred_hash', 'comment_id', 'comment'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().edit_comment(
		key=data["key"], 
		comment=data["comment"], 
		cred_hash=data['cred_hash'],
		comment_id=data['comment_id'],
		private_comment=data['private_comment']
	)


def delete_comment(data):
	"""Deletes a jira comment."""
	missing_params = missing_parameters(params=data, required=['key', 'cred_hash', 'comment_id'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().delete_comment(
		key=data["key"], 
		cred_hash=data['cred_hash'],
		comment_id=data['comment_id']
	)


def add_work_log(data):
	"""Add work time to a ticket."""
	missing_params = missing_parameters(params=data, required=['key', 'log_time', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().add_work_log(key=data["key"], time=data['log_time'], cred_hash=data['cred_hash'])


def get_jira_tickets(data):
	"""Gets all jira tickets by given filter number or JQL."""
	missing_params = missing_parameters(params=data, required=['cred_hash'])
	if missing_params:
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
		ticket['commit'] = build_commit_message(key=ticket['key'], msrp=ticket['msrp'], summary=ticket['summary'], epic_link=ticket['epic_link']) 
		ticket['branch'] = get_branch_name(username=ticket['username'], msrp=ticket['msrp'], summary=ticket['summary'])

	return jira_data


def find_key_by_msrp(data):
	"""Find a Jira key by it's MSRP."""
	missing_params = missing_parameters(params=data, required=['cred_hash','msrp'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().find_key_by_msrp(msrp=data['msrp'], cred_hash=data['cred_hash'])


def get_profile(data):
	"""Get a Jira user's profile data."""
	missing_params = missing_parameters(params=data, required=['username', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	jira_response = Jira().get_profile(cred_hash=data['cred_hash'])
	if not jira_response['status']:
		return {'status': False, 'data': f'Could not get user profile:'+ jira_response.get('data', '') }

	jira_response['data']['is_admin'] = os.environ['USER'] == data['username']
	return jira_response


def parse_comment(data):
	"""Parse out a Jira comment."""
	missing_params = missing_parameters(params=data, required=['cred_hash', 'comment', 'key'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().parse_comment(cred_hash=data['cred_hash'], comment=data['comment'], key=data['key'])


def modify_watchers(data):
	"""Add, remove, or get all Jira ticket watchers."""
	missing_params = missing_parameters(params=data, required=['type_of_modify', 'key', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	type_of_modify = data.get('type_of_modify', '')

	if type_of_modify in ['add','remove']:
		missing_params = missing_parameters(params=data, required=['username'])
		if missing_params:
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


def get_active_sprints(data):
	"""Get all actrive sprints."""
	missing_params = missing_parameters(params=data, required=['cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().get_active_sprints(cred_hash=data['cred_hash'])