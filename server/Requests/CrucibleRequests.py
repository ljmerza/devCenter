#!/usr/bin/python3

from FlaskUtils import missing_parameters
from Crucible.Crucible import Crucible


def crucible_create_review(data, pull_response):
	'''creates a crucbile review
	'''
	missing_params = missing_parameters(params=data, required=['key', 'msrp', 'username', 'password', 'repos','cred_hash']):
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	crucible_obj = Crucible()
	jira_obj = Jira()

	if len(data['repos']) == 0:
		return {"status": False, "data": 'No repos provided to create Crucible'}

	repo = data['repos'][0]
	if 'reviewedBranch' not in repo:
		return {"status": False, "data": 'No repos provided to create Crucible'}
		
	qa_response = jira_obj.find_crucible_title_data(msrp=data['msrp'], cred_hash=data['cred_hash'])
	if not qa_response['status']:
		return {"status": False, "data": 'Could not get Jira ticket data to make title: '+qa_response['data']}


	return crucible_obj.generate_crucible(data=data, cred_hash=data['cred_hash'], pull_response=pull_response)
