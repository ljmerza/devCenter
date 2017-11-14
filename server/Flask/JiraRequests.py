#!/usr/bin/python3

from Flask import FlaskUtils


def set_pcr_complete(data, jira_obj):
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash','key'])
	if missing_params:
		return {"data": "Missing required parameters: "+ missing_params, "status": False}
	# PCR complete jira ticket
	return jira_obj.set_pcr_complete(key=data['key'], cred_hash=data['cred_hash'])


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
		return {"data": "Missing required parameters: "+ missing_params, "status": False}
		
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

	# return results
	return jira_data


def find_key_by_msrp(data, jira_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash','msrp'])
	if missing_params:
		return {"data": "Missing required parameters: "+ missing_params, "status": False}
	# get key from MSRP
	return jira_obj.find_key_by_msrp(msrp=data['msrp'], cred_hash=data['cred_hash'])