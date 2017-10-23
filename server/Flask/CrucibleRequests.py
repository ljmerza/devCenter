#!/usr/bin/python3


from Flask import FlaskUtils
from Crucible.Crucible import Crucible
from Jira.Jira import Jira

crucible = Crucible()
jira = Jira()



def set_pcr_pass(data):

	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['username','crucible_id','cred_hash'])
	if missing_params:
		return {"data": "Missing required parameters: "+ missing_params, "status": False}

	# add self as reviewer
	response = crucible.add_reviewer(username=data['username'], crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"data": "Could not add "+data['username']+" as a reviewer", "status": False}

	# complete review
	response = crucible.complete_review(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"data": "Could not complete review", "status": False}

	# add PCR pass comment
	response = crucible.add_pcr_pass(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"data": "Could not add PCR pass comment", "status": False}

	# get number of PCR passes
	number_of_passes = crucible.get_pcr_pass(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"data": "Could not get number of PCR passes", "status": False}

	# return ok
	return {"status": True, "number": number_of_passes}




def crucible_create_review(data):

	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['username','repos','qa_steps','autoPCR','autoCR','cred_hash'])
	if missing_params:
		return {"data": "Missing required parameters: "+ missing_params, "status": False}

	# get msrp of ticket from first branch
	repo = data['repos'][0]
	branch = repo['reviewedBranch']
	msrp = branch.split('-')[1]
	
	# get issue data from Crucible title
	qa_response = jira.find_crucible_title_data(msrp=msrp, cred_hash=data['cred_hash'])
	if not qa_response['status']:
		return {"status": False, "data": 'Could not get Crucible data to make title: '+qa_response['data']}

	# save crucible title
	qa_response = qa_response['data']
	data['title'] = crucible.create_crucible_title(story_point=qa_response['story_point'], key=qa_response["key"], msrp=msrp, summary=qa_response['summary'])

	# create crucible
	crucible_data = crucible.create_crucible(data=data, cred_hash=data['cred_hash'])
	# if error on create crucible close crucible and return error
	if not crucible_data['status']:
		return {"status": False, "data": 'Could not create Crucible review: '+crucible_data['data']}
	
	# if QA step exist then modify Jira data
	if 'qa_steps' in data and data['qa_steps']:

		# generate QA steps
		qa_steps = jira.generate_qa_template(qa_steps=data['qa_steps'], repos=data['repos'], crucible_id=crucible_data['data'])
		comment_response = jira.add_comment(key=qa_response["key"], comment=qa_steps, cred_hash=data['cred_hash'])

		# check if Jira comment created
		if not comment_response['status']:
			return {"status": False, "data": 'Could not add comment to Jira: '+comment_response['data']}

		# set PCR if needed
		if 'autoPCR' in data and data['autoPCR']:
			pcr_response = jira.set_pcr_needed(key=qa_response["key"], cred_hash=data['cred_hash'])
			if not pcr_response['status']:
				return {"status": False, "data": 'Could not set Jira to PCR Needed: '+pcr_response['data']}

		# set CR if needed
		if 'autoCR' in data and data['autoCR']:
			cr_response = jira.set_code_review(key=qa_response["key"], cred_hash=data['cred_hash'])
			if not cr_response['status']:
				return {"status": False, "data": 'Could not set Jira ticket to Code Review: '+cr_response['data']}

		if 'log_time' in data and data['log_time']:
			log_response = jira.add_work_log(key=qa_response["key"], time=data['log_time'], cred_hash=data['cred_hash'])
			if not log_response['status']:
				return {"status": False, "data": 'Could not log time to Jira: '+log_response['data']}

	# return data
	return {"status": True, "data": {'jira': qa_response["key"], 'crucible': crucible_data['data']}}


def get_repos(data):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash'])
	if missing_params:
		return {"data": "Missing required parameters: "+ missing_params, "status": False}
	# return data
	return crucible.get_repos(cred_hash=data['cred_hash'])


def get_branches(data):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash', 'repo_name'])
	if missing_params:
		return {"data": "Missing required parameters: "+ missing_params, "status": False}
	# return data
	return crucible.get_branches(cred_hash=data['cred_hash'], repo_name=data['repo_name'])


def find_branch(data):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['cred_hash', 'repo_name', 'msrp'])
	if missing_params:
		return {"data": "Missing required parameters: "+ missing_params, "status": False}
	# return data
	return crucible.find_branch(repo_name=data['repo_name'], cred_hash=data['cred_hash'], msrp=data['msrp'])