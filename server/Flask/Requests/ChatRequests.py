#!/usr/bin/python3

from Flask import FlaskUtils

def send_ping(data, chat_obj, jira_obj, crucible_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['username', 'ping_type','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# we dont have enough ticket info so get that from Jira now
	jira_response = jira_obj.get_full_ticket(cred_hash=data['cred_hash'] , key=data['key'])

	if not jira_response['status'] or len(jira_response['data']) == 0:
		return {"data": f"could not get Jira ticket: "+{jira_response['data']}, "status": False}

	# merge results
	username = data['username'] # save original username for who to ping
	data = {**data, **jira_response['data'][0]}

	if data['ping_type'] == 'new':

		pcr_estimate = crucible_obj.get_pcr_estimate(story_point=data['story_point'])

		return chat_obj.send_new_ticket( 
			key=data['key'], msrp=data['msrp'], summary=data['summary'], 
			username=username, story_point=data['story_point'], 
			pcr_estimate=pcr_estimate
		)

	elif data['ping_type'] == 'merge':
		return chat_obj.send_merge_needed( 
			key=data['key'], msrp=data['msrp'], summary=data['summary'], 
			username=username, sprint=data['sprint']
		)

	# else send not implemented
	else:
		return {"data": "Ping reset not implemented", "status": False}

	
