#!/usr/bin/python3

from Flask import FlaskUtils
import ChatUtils


def set_status(data, jira_obj):
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash','key','status_type'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	if data['status_type'] == 'inDev':
		return jira_obj.set_in_dev(key=data['key'], cred_hash=data['cred_hash'])
	if data['status_type'] == 'pcrNeeded':
		return jira_obj.set_pcr_needed(key=data['key'], cred_hash=data['cred_hash'])
	if data['status_type'] == 'pcrCompleted':
		return jira_obj.set_pcr_complete(key=data['key'], cred_hash=data['cred_hash'])
	if data['status_type'] == 'cr':
		return jira_obj.set_code_review(key=data['key'], cred_hash=data['cred_hash'])	

	elif data['status_type'] == 'inQA':
		return jira_obj.set_in_qa(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'qaFail':
		return jira_obj.set_qa_fail(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'qaPass':
		return jira_obj.set_qa_pass(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'mergeCode':
		return jira_obj.set_merge_code(key=data['key'], cred_hash=data['cred_hash'])
	elif data['status_type'] == 'mergeConflict':
		return jira_obj.set_merge_conflict(key=data['key'], cred_hash=data['cred_hash'])

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
	missing_params = FlaskUtils.check_args(params=data, required=['key', 'crucible_id','repos', 'qa_steps', 'cred_hash'])
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
			uct_date (str) the date to use for UCT not ready (optional)
		jira_obj (Class instance) Jira class instance to connect to Jira

	Returns:

	'''
	response = ''
	missing_params = FlaskUtils.check_args(params=data, required=['key', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# set uct date if given
	uct_date = data.get('uct_date', 0)

	if data.get('remove_merge', False):
		response = jira_obj.remove_merge_code(key=data['key'], cred_hash=data['cred_hash'])

	if data.get('remove_conflict', False):
		response = jira_obj.remove_merge_conflict(key=data['key'], cred_hash=data['cred_hash'])

	# try to add comment an return
	if data["comment"]:
		response = jira_obj.add_comment(
			key=data["key"], comment=data["comment"], 
			cred_hash=data['cred_hash'],
			uct_date=uct_date
		)

	return response

def edit_comment(data, jira_obj):
	'''adds a comment to a ticket

	Args:
		data (dict) object with properties:
			cred_hash (str) Authorization header value
			key (str) the Jira key to post a comment to
			comment (str) the comment to add to the the ticket
			uct_date (str) the date to use for UCT not ready (optional)
		jira_obj (Class instance) Jira class instance to connect to Jira

	Returns:

	'''
	missing_params = FlaskUtils.check_args(params=data, required=['key', 'cred_hash', 'comment_id', 'comment'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}


	# try to add comment an return
	return jira_obj.edit_comment(
		key=data["key"], comment=data["comment"], 
		cred_hash=data['cred_hash'],
		comment_id=data['comment_id']
	)

def add_worklog(data, jira_obj):
	'''Adds a work log to a ticket

	Args:
		data (dict) object with properties:
			cred_hash (str) Authorization header value
			key (str) the Jira key to post a comment to
			log_time (str) the time to add to the work log
		jira_obj (Class instance) Jira class instance to connect to Jira

	Returns:

	'''
	missing_params = FlaskUtils.check_args(params=data, required=['key', 'log_time', 'cred_hash'])
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
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash', 'fields'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
		
	# check if we have a filer number or JQL string
	if 'filter_number' in data:
		filter_number = data['filter_number']
	elif 'jql' in data:
		jql = data['jql']
	else:
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
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash','msrp'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# get key from MSRP
	return jira_obj.find_key_by_msrp(msrp=data['msrp'], cred_hash=data['cred_hash'])

def get_profile(data, jira_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# get key from MSRP
	return jira_obj.get_profile(cred_hash=data['cred_hash'])