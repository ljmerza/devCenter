#!/usr/bin/python3

from ..FlaskUtils import missing_parameters
from ..Crucible.Crucible import Crucible


def crucible_create_review(data, pull_response):
	'''creates a crucbile review
	'''
	if missing_parameters(params=data, required=['key', 'msrp', 'username', 'password', 'repos','cred_hash']):
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

	qa_response = qa_response['data']
	data['title'] = crucible_obj.create_crucible_title(story_point=qa_response['story_point'], key=qa_response["key"], msrp=data['msrp'], summary=qa_response['summary'])

	return crucible_obj.generate_crucible(data=data, cred_hash=data['cred_hash'], pull_response=pull_response)
