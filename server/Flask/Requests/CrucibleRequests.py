#!/usr/bin/python3

from ..FlaskUtils import check_parameters

def add_reviewer(data, crucible_obj):
	missing_params = check_parameters(params=data, required=['username','crucible_id','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return crucible_obj.add_reviewer(user=data['username'], crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])

def complete_review(data, crucible_obj):
	missing_params = check_parameters(params=data, required=['username','crucible_id','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return crucible_obj.complete_review(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])


def pass_review(data, crucible_obj):
	missing_params = check_parameters(params=data, required=['username','crucible_id','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# add user to review without checking if worked or not
	add_reviewer(data=data, crucible_obj=crucible_obj)
	complete_review(data=data, crucible_obj=crucible_obj)

	response = crucible_obj.add_pcr_pass(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"data": f"Could not add PCR pass comment {response['data']}", "status": False}

	return {"status": True}

def crucible_create_review(data, crucible_obj, jira_obj, pull_response):
	missing_params = check_parameters(params=data, required=['key', 'msrp', 'username', 'password', 'repos','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	if len(data['repos']) == 0:
		return {"status": False, "data": 'No repos provided to create Crucible'}

	repo = data['repos'][0]
	if 'reviewedBranch' not in repo:
		return {"status": False, "data": 'No repos provided to create Crucible'}
		
	qa_response = jira_obj.find_crucible_title_data(msrp=data['msrp'], cred_hash=data['cred_hash'])
	if not qa_response['status']:
		return {"status": False, "data": 'Could not get Crucible data to make title: '+qa_response['data']}

	qa_response = qa_response['data']
	data['title'] = crucible_obj.create_crucible_title(story_point=qa_response['story_point'], key=qa_response["key"], msrp=data['msrp'], summary=qa_response['summary'])

	return crucible_obj.generate_crucible(data=data, cred_hash=data['cred_hash'], pull_response=pull_response)

def get_comments(data, crucible_obj):
	missing_params = check_parameters(params=data, required=['crucible_id', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	return crucible_obj.get_comments(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])