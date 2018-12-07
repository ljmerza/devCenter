#!/usr/bin/python3
import os

from FlaskUtils import missing_parameters
from ServerUtils import build_commit_message, get_branch_name
from Jira.Jira import Jira
from CodeCloud.CodeCloud import CodeCloud

from Requests.jira_status import pcr_complete_transition, pcr_pass_transition, pcr_working_transition, qa_ready_transition, qa_pass_transition, uct_ready_transition

def set_status(data):
	'''sets a Jira ticket's status
	'''
	missing_params = missing_parameters(params=data, required=['cred_hash','key','status_type'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	response = {"status": False}
	jira = Jira()

	if data['status_type'] == 'inDev':
		response = jira.set_in_dev(key=data['key'], cred_hash=data['cred_hash'])

	elif data['status_type'] == 'pcrNeeded':
		response = jira.set_pcr_needed(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'removePcrNeeded':
		response = jiraremove_pcr_needed(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'pcrWorking':
		response = pcr_working_transition(data=data)
	elif data['status_type'] == 'pcrPass':
		response = pcr_pass_transition(data=data)
	elif data['status_type'] == 'pcrCompleted':
		response = pcr_complete_transition(data=data)
	elif data['status_type'] == 'removePcrCompleted':
		response = jira.remove_pcr_complete(key=data['key'], cred_hash=data['cred_hash'])

	elif data['status_type'] == 'cr':
		response = jira.set_code_review(key=data['key'], cred_hash=data['cred_hash'])

	elif data['status_type'] == 'qaReady':
		response = qa_ready_transition(data)
	elif data['status_type'] == 'inQa':
		response = jira.set_in_qa(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'qaFail':
		response = jira.set_qa_fail(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'qaPass':
		response = qa_pass_transition(data)

	elif data['status_type'] == 'mergeCode':
		response = jira.set_merge_code(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'mergeConflict':
		response = jira.set_merge_conflict(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'removeMergeConflict':
		response = jira.remove_merge_conflict(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'uctReady':
		response = uct_ready_transition(data)

	elif data['status_type'] == 'inUct':
		response = jira.set_in_uct(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'uctPass':
		response = jira.set_uct_pass(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'uctFail':
		response = jira.set_uct_fail(key=data['key'], cred_hash=data['cred_hash'])

	print(response)

	# save key and get new status for response
	if response['status']:
		response['data']['key'] = data['key']
		response = get_new_component(response=response, key=data['key'], cred_hash=data['cred_hash'])
	return response

def get_new_component(response, key, cred_hash):
	'''gets the new component for a ticket if the status transition worked
	'''
	# if we didnt create a data prop then create one
	if(not response.get('data', False)):
		response['data'] = {}

	# get new ticket data so we can get new component
	jira = Jira()
	new_ticket = jira.get_ticket_field_values(key=key, cred_hash=cred_hash, fields='components,status', get_expanded=False)
	if(not new_ticket['status']):
		return response

	response['data']['new_status'] = {
		'component': new_ticket['data'].get('component', ''),
		'status': new_ticket['data'].get('status', ''),
	}
	return response

def add_comment(data):
	'''Add a Jira comment to a ticket
	'''
	missing_params = missing_parameters(params=data, required=['key', 'cred_hash', 'comment'])
	if missing_params:
		return {"data": missing_params, "status": False}

	response = Jira().add_comment(
		key=data["key"], 
		comment=data["comment"], 
		cred_hash=data['cred_hash']
	)
	return response

def edit_comment(data):
	'''Edits a Jira comment
	'''
	missing_params = missing_parameters(params=data, required=['key', 'cred_hash', 'comment_id', 'comment'])
	if missing_params:
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
	missing_params = missing_parameters(params=data, required=['key', 'cred_hash', 'comment_id'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().delete_comment(
		key=data["key"], 
		cred_hash=data['cred_hash'],
		comment_id=data['comment_id']
	)

def add_work_log(data):
	'''add work time to a ticket
	'''
	missing_params = missing_parameters(params=data, required=['key', 'log_time', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().add_work_log(key=data["key"], time=data['log_time'], cred_hash=data['cred_hash'])

def get_jira_tickets(data):
	'''gets all jira tickets by given filter number or JQL
	'''
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
	'''find a Jira key by it's MSRP
	'''
	missing_params = missing_parameters(params=data, required=['cred_hash','msrp'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().find_key_by_msrp(msrp=data['msrp'], cred_hash=data['cred_hash'])

def get_profile(data):
	'''get a Jira user's profile data
	'''
	missing_params = missing_parameters(params=data, required=['username', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	jira_response = Jira().get_profile(cred_hash=data['cred_hash'])
	if not jira_response['status']:
		return {'status': False, 'data': f'Could not get user profile:'+ jira_response.get('data', '') }

	jira_response['data']['is_admin'] = os.environ['USER'] == data['username']
	return jira_response

def parse_comment(data):
	'''parse out a Jira comment
	'''
	missing_params = missing_parameters(params=data, required=['cred_hash', 'comment', 'key'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().parse_comment(cred_hash=data['cred_hash'], comment=data['comment'], key=data['key'])

def modify_watchers(data):
	'''add, remove, or get all Jira ticket watchers
	'''
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
	missing_params = missing_parameters(params=data, required=['cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return Jira().get_active_sprints(cred_hash=data['cred_hash'])