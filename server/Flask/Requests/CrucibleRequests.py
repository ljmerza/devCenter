#!/usr/bin/python3

from Flask import FlaskUtils


def complete_review(data, crucible_obj):
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['username','crucible_id','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# add self as reviewer
	response = crucible_obj.add_reviewer(username=data['username'], crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"data": "Could not add "+data['username']+" as a reviewer", "status": False}

	# complete review
	response = crucible_obj.complete_review(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"data": "Could not complete review", "status": False}

	# add PCR pass comment
	response = crucible_obj.add_pcr_pass(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"data": "Could not add PCR pass comment", "status": False}

	# return ok
	return {"status": True}

def crucible_create_review(data, crucible_obj, jira_obj):
	'''creates a crucible review and returns the cru id created
	'''

	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['key', 'username', 'password', 'repos','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# check for repos
	if len(data['repos']) == 0:
		return {"status": False, "data": 'No repos provided to create Crucible'}

	# get msrp of ticket from first branch
	repo = data['repos'][0]

	# check data
	if 'reviewedBranch' not in repo:
		return {"status": False, "data": 'No repos provided to create Crucible'}

	branch = repo['reviewedBranch']
	msrp = branch.split('-')[1]
	
	# get issue data from Crucible title
	qa_response = jira_obj.find_crucible_title_data(msrp=msrp, cred_hash=data['cred_hash'])
	if not qa_response['status']:
		return {"status": False, "data": 'Could not get Crucible data to make title: '+qa_response['data']}

	# save crucible title
	qa_response = qa_response['data']
	data['title'] = crucible_obj.create_crucible_title(story_point=qa_response['story_point'], key=qa_response["key"], msrp=msrp, summary=qa_response['summary'])

	# create crucible
	return crucible_obj.create_crucible(data=data, cred_hash=data['cred_hash'])


def get_repos(data, crucible_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# return data
	return crucible_obj.get_repos(cred_hash=data['cred_hash'])


def get_branches(data, crucible_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash', 'repo_name'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# return data
	return crucible_obj.get_branches(cred_hash=data['cred_hash'], repo_name=data['repo_name'])


def ticket_branches(data, crucible_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash', 'msrp'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# return data
	return crucible_obj.ticket_branches(cred_hash=data['cred_hash'], msrp=data['msrp'])