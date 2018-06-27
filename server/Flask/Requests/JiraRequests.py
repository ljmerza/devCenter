#!/usr/bin/python3
import os

from Flask import FlaskUtils
import ChatUtils


def set_status(data, jira_obj):
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['cred_hash','key','status_type'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	if data['status_type'] == 'inDev':
		return jira_obj.set_in_dev(key=data['key'], cred_hash=data['cred_hash'])

	if data['status_type'] == 'pcrNeeded':
		return jira_obj.set_pcr_needed(key=data['key'], cred_hash=data['cred_hash'])
	if data['status_type'] == 'removePcrNeeded':
		return jira_obj.remove_pcr_needed(key=data['key'], cred_hash=data['cred_hash'])
	if data['status_type'] == 'pcrCompleted':
		return jira_obj.set_pcr_complete(key=data['key'], cred_hash=data['cred_hash'])
	if data['status_type'] == 'removePcrCompleted':
		return jira_obj.remove_pcr_complete(key=data['key'], cred_hash=data['cred_hash'])

	if data['status_type'] == 'cr':
		return jira_obj.set_code_review(key=data['key'], cred_hash=data['cred_hash'])

	elif data['status_type'] == 'qaReady':
		response = {'status': True, 'data': {}}
		response['data']['qa_ready_response'] = jira_obj.set_ready_for_qa(key=data['key'], cred_hash=data['cred_hash'])
		response['data']['comment_response'] = jira_obj.add_comment(key=data['key'], cred_hash=data['cred_hash'], comment='CR Pass')

	elif data['status_type'] == 'inQa':
		return jira_obj.set_in_qa(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'qaFail':
		return jira_obj.set_qa_fail(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'qaPass':
		response = {'status': True, 'data': {}}
		response['data']['qa_pass'] = jira_obj.set_qa_pass(key=data['key'], cred_hash=data['cred_hash'])
		response['data']['merge_code'] = jira_obj.set_merge_code(key=data['key'], cred_hash=data['cred_hash'])
		response['data']['comment_response'] = jira_obj.add_comment(key=data['key'], cred_hash=data['cred_hash'], comment='QA Pass')
		return response

	elif data['status_type'] == 'mergeCode':
		return jira_obj.set_merge_code(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'mergeConflict':
		return jira_obj.set_merge_conflict(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'removeMergeConflict':
		return jira_obj.remove_merge_conflict(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'uctReady':
		return jira_obj.remove_merge_code(key=data['key'], cred_hash=data['cred_hash'])

	elif data['status_type'] == 'inUct':
		return jira_obj.set_in_uct(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'uctPass':
		return jira_obj.set_uct_pass(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'uctFail':
		return jira_obj.set_uct_fail(key=data['key'], cred_hash=data['cred_hash'])
	else:
		return {"status": False, "data": 'Invalid status type'}


def add_qa_comment(data, jira_obj):
	'''creates a QA comment and posts it to a ticket

	Args:
		data (dict) object with properties:
			cred_hash (str) Authorization header value
		jira_obj (Class instance) Jira class instance to connect to Jira

	Returns:

	'''
	missing_params = FlaskUtils.check_parameters(params=data, required=['key', 'crucible_id','repos', 'qa_steps', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# generate QA steps
	qa_steps = jira_obj.generate_qa_template(qa_steps=data['qa_steps'], repos=data['repos'], crucible_id=data['crucible_id'])
	data['comment'] = qa_steps
	# add comment to Jira
	return add_comment(data=data, jira_obj=jira_obj)


def add_comment(data, jira_obj):
	'''adds a comment to a ticket

	Args:
		data (dict) object with properties:
			cred_hash (str) Authorization header value
			key (str) the Jira key to post a comment to
			comment (str) the comment to add to the the ticket
		jira_obj (Class instance) Jira class instance to connect to Jira

	Returns:

	'''
	response = ''
	missing_params = FlaskUtils.check_parameters(params=data, required=['key', 'cred_hash', 'comment'])
	if missing_params:
		return {"data": missing_params, "status": False}


	# try to add comment an return
	response = jira_obj.add_comment(
		key=data["key"], 
		comment=data["comment"], 
		cred_hash=data['cred_hash']
	)

	return response

def add_commit_comment(data, jira_obj, crucible_obj):
	'''Adds a Jira comment with all the commits for a Jira ticket
	'''
	missing_params = FlaskUtils.check_parameters(params=data, required=['key', 'cred_hash', 'master_branch'])
	if missing_params:
		return {"data": missing_params, "status": False}

	commit_response = crucible_obj.get_commit_ids(key=data['key'], master_branch=data['master_branch'], cred_hash=data['cred_hash'])
	if not commit_response['status']:
		return {"data": commit_response['data'], "status": False}

	comment = 'The following branches have been committed:\n || Repo || Branch || SHA-1 ||\n'
	for commit in commit_response.get('data', []):
		repo_name = commit.get('repo_name')
		master_branch = commit.get('master_branch')
		commit_id = commit.get('commit_id')
		comment += f"| {repo_name} | {master_branch} | {commit_id} |\n"

	return jira_obj.add_comment(
		key=data["key"], 
		comment=comment, 
		cred_hash=data['cred_hash']
	)

def edit_comment(data, jira_obj):
	'''adds a comment to a ticket

	Args:
		data (dict) object with properties:
			cred_hash (str) Authorization header value
			key (str) the Jira key to post a comment to
			comment (str) the comment to add to the the ticket
			comment_id (str) the comment id to edit
		jira_obj (Class instance) Jira class instance to connect to Jira

	Returns:

	'''
	missing_params = FlaskUtils.check_parameters(params=data, required=['key', 'cred_hash', 'comment_id', 'comment'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}


	# try to add comment an return
	return jira_obj.edit_comment(
		key=data["key"], 
		comment=data["comment"], 
		cred_hash=data['cred_hash'],
		comment_id=data['comment_id']
	)

def delete_comment(data, jira_obj):
	'''adds a comment to a ticket

	Args:
		data (dict) object with properties:
			cred_hash (str) Authorization header value
			key (str) the Jira key to post a comment to
			comment_id (str) the comment id to delete
		jira_obj (Class instance) Jira class instance to connect to Jira

	Returns:

	'''
	missing_params = FlaskUtils.check_parameters(params=data, required=['key', 'cred_hash', 'comment_id'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}


	# try to add comment an return
	return jira_obj.delete_comment(
		key=data["key"], 
		cred_hash=data['cred_hash'],
		comment_id=data['comment_id']
	)

def add_work_log(data, jira_obj):
	'''Adds a work log to a ticket

	Args:
		data (dict) object with properties:
			cred_hash (str) Authorization header value
			key (str) the Jira key to post a comment to
			log_time (str) the time to add to the work log
		jira_obj (Class instance) Jira class instance to connect to Jira

	Returns:

	'''
	missing_params = FlaskUtils.check_parameters(params=data, required=['key', 'log_time', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# try to add work log and return
	return jira_obj.add_work_log(key=data["key"], time=data['log_time'], cred_hash=data['cred_hash'])
	

def get_jira_tickets(data, jira_obj):
	'''gets a list of formatted Jira tickets given a filter or url (adds the Crucible id if it can)

	Args:
		data (dict) object with properties:
			cred_hash (str) Authorization header value
			filter_number (str) the filter number to get tickets from
			url (str) the url to use to get tickets instead of by filternumber
			fields (str) the fields to get from the Jira tickets
			jql (str) optional JQL to get the tickets from (will retrieve from filter_number if not given)
		jira_obj (Class instance) Jira class instance to connect to Jira

	Returns:
		the server response JSON object with status/data properties
	'''

	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
		
	# check if we have a filer number or JQL string
	filter_number = data.get('filter_number', False)
	jql = data.get('jql', False)

	if not filter_number and not jql:
		return {"data": "A filter number or JQL is required", "status": False}

	# get jira tickets
	jira_data = jira_obj.get_jira_tickets(filter_number=filter_number, cred_hash=data['cred_hash'], fields=data['fields'], jql=data['jql'])

	if not jira_data['status']:
		return {'status': False, 'data': f'Could not get Jira tickets for filter number {filter_number}: '+jira_data['data'] }

	# add commit messages and branch names
	for ticket in jira_data['data']:
		ticket['commit'] = ChatUtils.build_commit_message(ticket['key'], ticket['msrp'], ticket['summary']) 
		ticket['branch'] = ChatUtils.get_branch_name(ticket['username'], ticket['msrp'], ticket['summary'])

	# return results
	return jira_data


def find_key_by_msrp(data, jira_obj):
	'''

	Args:
		data (dict) object with properties:
		msrp (str) the msrp of the ticket to find
			cred_hash (str) Authorization header value
		jira_obj (Class instance) Jira class instance to connect to Jira

	Returns:
		the server response JSON object with status/data properties
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['cred_hash','msrp'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# get key from MSRP
	return jira_obj.find_key_by_msrp(msrp=data['msrp'], cred_hash=data['cred_hash'])

def get_profile(data, jira_obj, sql_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['username', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# get user profile from Jira
	jira_response = jira_obj.get_profile(cred_hash=data['cred_hash'])
	if not jira_response['status']:
		return {'status': False, 'data': f'Could not get user profile:'+ jira_response.get('data', '') }

	# is admin?
	jira_response['data']['is_admin'] = os.environ['USER'] == data['username']

	return jira_response


def parse_comment(data, jira_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['cred_hash', 'comment', 'key'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# get parsed comment
	return jira_obj.parse_comment(cred_hash=data['cred_hash'], comment=data['comment'], key=data['key'])

def modify_watchers(data, jira_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['type_of_modify', 'key'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# get type of watcher action we are doing
	type_of_modify = data.get('type_of_modify', '')

	# check for required username
	if type_of_modify in ['add','remove']:
		missing_params = FlaskUtils.check_parameters(params=data, required=['username'])
		if missing_params:
			return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# complete action
	if type_of_modify == 'add':
		return jira_obj.add_watcher(username=data['username'], cred_hash=data['cred_hash'], key=data['key'])

	elif type_of_modify == 'remove':
		return jira_obj.remove_watcher(username=data['username'], cred_hash=data['cred_hash'], key=data['key'])

	elif type_of_modify == 'get':
		return jira_obj.get_watchers(cred_hash=data['cred_hash'], key=data['key'])

	else:
		return {
			'status': False,
			'data': f'Invalid type of watcher modify: {type_of_modify}'
		}
