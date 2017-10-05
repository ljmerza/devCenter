import crucible
import Jira

crucible = crucible.Crucible()
jira = Jira.Jira()

def crucible_pcr_pass(data):
	# check for required data
	if(not 'cred_hash' in data or not 'crucible_id' in data or not 'attuid' in data):
		return {"response": "Missing required parameters: "+ data, "status": "ERROR"}
	# add self as reviewer
	response = crucible.add_reviewer(attuid=data['attuid'], crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"response": "Could not add "+data['attuid']+" as a reviewer", "status": "ERROR"}
	# complete review
	response = crucible.complete_review(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"response": "Could not complete review", "status": "ERROR"}
	# add PCR pass comment
	response = crucible.add_pcr_pass(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"response": "Could not add PCR pass comment", "status": "ERROR"}
	# get number of PCR passes
	number_of_passes = crucible.get_pcr_pass(crucible_id=data['crucible_id'], cred_hash=data['cred_hash'])
	if not response['status']:
		return {"response": "Could not get number of PCR passes", "status": "ERROR"}
	# return ok
	return {"status": "OK", "number": number_of_passes}




def crucible_create_review(data):
	# check param data
	if(not 'attuid' in data or not 'password' in data or not 'repos' in data or not 'qa_steps' in data or not 'autoPCR' in data or not 'autoCR' in data):
		return {"response": "Missing required parameters: "+data, "status": "ERROR", "jira_link": 'ERROR'}
	
	# login
	crucible_login = crucible.login(attuid=data['attuid'], password=data['password'])
	if not crucible_login['status']:
		return {"response": "Invalid credsentials", "status": "ERROR", "jira_link": 'ERROR'}
	response = jira.login(attuid=data['attuid'], password=data['password'])
	if not response['status']:
		return {"response": "Could not log into Jira: invalid password", "status": "ERROR", "jira_link": ''}
	
	# get msrp of ticket from first branch
	repo = data['repos'][0]
	branch = repo['reviewedBranch']
	msrp = branch.split('-')[1]
	
	# create crucible title
	title_data = jira.find_qa_data(msrp=msrp)
	if( title_data['status'] and not 'story_point' in title_data or not 'key' in title_data or not 'summary' in title_data ):
		return {"response": "Could not find matching msrp in Jira", "status": "ERROR", "jira_link": ''}
	
	# get key and save crucible title
	key = title_data["key"]
	data['title'] = crucible.create_crucible_title(story_points=title_data['story_point'], key=key, msrp=msrp, summary=title_data['summary'])
	# create crucible
	crucible_data = crucible.create_crucible(data=data)
	# if error on create crucible close crucible and return error
	if not crucible_data['status']:
		response = crucible_data['response']
		return {"response": f"Could not create crucible: {response}", "status": "ERROR", "jira_link": jira.ticket_base+'/'+key}
	
	# generate qa step template and add comment to jira
	if 'qa_steps' in data and data['qa_steps']:
		qa_steps = jira.generate_qa_template(qa_steps=data['qa_steps'], repos=data['repos'], crucible_id=crucible_data['response'])
		response = jira.add_comment(key=title_data['key'], comment=qa_steps)
		# check if jira comment created
		if not response['status']:
			return {"response": response, "status": "ERROR", "jira_link": jira.ticket_base+'/'+key}

		# set PCR if needed
		if 'autoPCR' in data and data['autoPCR']:
			response = jira.set_pcr_needed(key=key)
			if not response['status']:
				return {"response": f"Could not transition Jira component to PCR needed: {response}", "status": "ERROR", "jira_link": jira.ticket_base+'/'+key}
		# set CR if needed
		if 'autoCR' in data and data['autoCR']:
			response = jira.set_code_review(key=key)
			if not response['status']:
				return {"response": f"Could not transition Jira status to Code Review: {response}", "status": "ERROR", "jira_link": jira.ticket_base+'/'+key}
		
		if 'log_time' in data and data['log_time']:
			response = jira.add_work_log(key=key, time=data['log_time'])
			if not response['status']:
				return {"response": f"Could not add work log to Jira: {response}", "status": "ERROR", "jira_link": jira.ticket_base+'/'+key}

	# return data
	return {"response": crucible_data['response'], "status": "OK", "jira_link": jira.ticket_base+'/'+key}