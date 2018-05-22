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
	
def set_user_pings(data, sql_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['username', 'fields'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	session = sql_obj.login()
	response = sql_obj.set_user_pings(
		username=data['username'],
		fields=data['fields'],
		session=session
	)
	sql_obj.logout(session=session)
	return response



def send_custom_ping(data, chat_obj, crucible_obj, jira_obj):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_parameters(params=data, required=['ping_type', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	if(data['ping_type'] == 'user'):
		missing_params = FlaskUtils.check_parameters(params=data, required=['username', 'message'])
		if missing_params:
			return {"data": f"Missing required parameters: {missing_params}", "status": False}
		chat_obj.send_message(message=data.get('message'), username=data('username'))

	elif(data['ping_type'] == 'pcrNeeded'):
		missing_params = FlaskUtils.check_parameters(params=data, required=['key'])
		if missing_params:
			return {"data": f"Missing required parameters: {missing_params}", "status": False}

		response = _get_jira_ticket_for_ping(data=data, jira_obj=jira_obj, crucible_obj=crucible_obj)
		if not response['status']:
			return response

		chat_obj.send_pcr_needed(
			key=response.get('data').get('key'), 
			msrp=response.get('data').get('msrp'), 
			sprint=response.get('data').get('sprint'), 
			label=response.get('data').get('label'), 
			crucible_id=response.get('data').get('crucible_id'), 
			pcr_estimate=response.get('data').get('pcr_estimate'),
			override=True
		)
	else:
		chat_obj.send_meeting_message(message=data['message'], chatroom=data['username'])
	
	return {'status': True}


def _get_jira_ticket_for_ping(data, jira_obj, crucible_obj):
	'''
	'''
	jira_response = jira_obj.get_full_ticket(cred_hash=data['cred_hash'] , key=data['key'])

	if not jira_response['status'] or len(jira_response['data']) == 0:
		return {"data": f"could not get Jira ticket: "+{jira_response['data']}, "status": False}

	data = jira_response['data'][0]
	data['pcr_estimate'] = crucible_obj.get_pcr_estimate(story_point=data['story_point'])

	return {"data": data, "status": True}
