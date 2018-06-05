#!/usr/bin/python3

from Flask import FlaskUtils


def add_reviewer(data, crucible_obj):
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['username','crucible_id','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# add self as reviewer
	return crucible_obj.add_reviewer(user=data['username'], crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])


def complete_review(data, crucible_obj):
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['username','crucible_id','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# complete review
	return crucible_obj.complete_review(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])


def pass_review(data, crucible_obj):
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['username','crucible_id','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# add user to review without checking if worked or not
	add_response = add_reviewer(data=data, crucible_obj=crucible_obj)

	# complete review without checking if worked or not
	complete_response = complete_review(data=data, crucible_obj=crucible_obj)

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
	missing_params = FlaskUtils.check_parameters(params=data, required=['key', 'msrp', 'username', 'password', 'repos','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# check for repos
	if len(data['repos']) == 0:
		return {"status": False, "data": 'No repos provided to create Crucible'}

	# check branch data
	repo = data['repos'][0]
	if 'reviewedBranch' not in repo:
		return {"status": False, "data": 'No repos provided to create Crucible'}
	branch = repo['reviewedBranch']
	
	# get issue data from Crucible title
	qa_response = jira_obj.find_crucible_title_data(msrp=data['msrp'], cred_hash=data['cred_hash'])
	if not qa_response['status']:
		return {"status": False, "data": 'Could not get Crucible data to make title: '+qa_response['data']}

	# save crucible title
	qa_response = qa_response['data']
	data['title'] = crucible_obj.create_crucible_title(story_point=qa_response['story_point'], key=qa_response["key"], msrp=data['msrp'], summary=qa_response['summary'])

	# create crucible
	return crucible_obj.generate_crucible(data=data, cred_hash=data['cred_hash'])


def get_repos(data, crucible_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# return data
	return crucible_obj.get_repos(cred_hash=data['cred_hash'])


def get_branches(data, crucible_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['cred_hash', 'repo_name'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# return data
	return crucible_obj.get_branches(cred_hash=data['cred_hash'], repo_name=data['repo_name'])


def ticket_branches(data, crucible_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['cred_hash', 'msrp'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# return data
	return crucible_obj.ticket_branches(cred_hash=data['cred_hash'], msrp=data['msrp'])

def get_comments(data, crucible_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['crucible_id', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# return data
	return crucible_obj.get_comments(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])

def get_commit_ids(data, crucible_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['key', 'cred_hash', 'master_branch'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	# return data
	return crucible_obj.get_commit_ids(key=data['key'], cred_hash=data['cred_hash'], master_branch=data['master_branch'])