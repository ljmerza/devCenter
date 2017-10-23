#!/usr/bin/python3

from Flask import FlaskUtils
from Crucible.Crucible import Crucible
from Jira.Jira import Jira

crucible = Crucible()
jira = Jira()


def set_pcr_complete(data):
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash','key'])
	if missing_params:
		return {"data": "Missing required parameters: "+ missing_params, "status": False}
	# PCR complete jira ticket
	return jira.set_pcr_complete(key=data['key'], cred_hash=data['cred_hash'])


def get_jira_tickets_from_filter(data):
	'''gets a list of formatted Jira tickets given a filter (adds the Crucible id if it can)

	Args:
		data object with properties:
			cred_hash (str) Authorization header value
			filter_number (str) the filter number to get tickets from
			fields (str) the fields to get from the Jira tickets
			raw (bool) optional boolean to get formatted tickets or raw tickets (default true - formatted)

	Returns:
		the server response JSON object with status/data properties
	'''

	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash','filter_number', 'fields'])
	if missing_params:
		return {"data": "Missing required parameters: "+ missing_params, "status": False}
		
	filter_number = data['filter_number']

	# return formatted tickets or raw tickets
	if 'raw' in data and data['raw']:
		jira_data = jira.get_raw_jira_tickets(filter_number=filter_number, cred_hash=data['cred_hash'])
		if not jira_data['status']:
			return {'status': False, 'data': f'Could not get Jira tickets for filter number {filter_number}: '+jira_data['data'] }
		return jira_data
	else:
		# get jira tickets
		jira_data = jira.get_jira_tickets(filter_number=filter_number, cred_hash=data['cred_hash'], fields=data['fields'])
		if not jira_data['status']:
			return {'status': False, 'data': f'Could not get Jira tickets for filter number {filter_number}: '+jira_data['data'] }

		# add crucible links
		crucible_data = crucible.get_review_ids(issues=jira_data['data'], cred_hash=data['cred_hash'])
		if not crucible_data['status']:
			return {'status': False, 'data': f'Could not get Crucible data for filter number {filter_number}: '+crucible_data['data']}

		# return results
		return crucible_data


def find_key_by_msrp(data):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash','msrp'])
	if missing_params:
		return {"data": "Missing required parameters: "+ missing_params, "status": False}
	# get key from MSRP
	return jira.find_key_by_msrp(msrp=data['msrp'], cred_hash=data['cred_hash'])