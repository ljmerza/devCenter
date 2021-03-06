"""Handle all chat based requests."""
from devcenter.server_utils import missing_parameters
from devcenter.jira.jira import Jira
from devcenter.chat.chat import Chat
from devcenter.sql.sql import DevCenterSQL


def send_ping(data):
	"""Sends a ping to the chatroom."""
	missing_params = missing_parameters(params=data, required=['username', 'ping_type','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	
	chat_obj = Chat()
	jira_obj = Jira()

	# we dont have enough ticket info so get that from Jira now
	jira_response = jira_obj.get_full_ticket(cred_hash=data['cred_hash'] , key=data['key'])
	if not jira_response['status'] or len(jira_response['data']) == 0:
		return {"data": f"could not get Jira ticket: "+{jira_response['data']}, "status": False}

	# merge results
	username = data['username'] # save original username for who to ping
	data = {**data, **jira_response['data'][0]}

	if data['ping_type'] == 'new':
		pcr_estimate = jira_obj.get_pcr_estimate(story_point=data['story_point'])

		return chat_obj.send_new_ticket( 
			key=data['key'], 
			msrp=data['msrp'], 
			summary=data['summary'], 
			username=username, 
			story_point=data['story_point'], 
			pcr_estimate=pcr_estimate, 
			epic_link=data['epic_link']
		)

	elif data['ping_type'] == 'merge':
		return chat_obj.send_merge_needed( 
			key=data['key'], 
			msrp=data['msrp'], 
			summary=data['summary'], 
			username=username, 
			sprint=data['sprint'],
			epic_link=data['epic_link']
		)

	else:
		return {"data": "Ping reset not implemented", "status": False}
	

def set_user_pings(data):
	"""Sets a user's ping settings."""
	missing_params = missing_parameters(params=data, required=['username', 'fields'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	
	sql_obj = DevCenterSQL()
	response = sql_obj.set_user_pings(
		username=data['username'],
		fields=data['fields']
	)

	return response


def send_custom_ping(data):
	"""Send a custom ping to chatroom or a generated one from a ticket status transition."""
	missing_params = missing_parameters(params=data, required=['ping_type', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	chat_obj = Chat()

	if(data['ping_type'] == 'user'):
		missing_params = missing_parameters(params=data, required=['username', 'message'])
		if missing_params:
			return {"data": f"Missing required parameters: {missing_params}", "status": False}
		chat_obj.send_message(message=data.get('message'), username=data('username'))

	elif(data['ping_type'] == 'pcrNeeded'):
		missing_params = missing_parameters(params=data, required=['key'])
		if missing_params:
			return {"data": f"Missing required parameters: {missing_params}", "status": False}

		response = _get_jira_ticket_for_ping(data=data)
		if not response['status']:
			return response

		chat_obj.send_pcr_needed(
			key=response.get('data').get('key'), 
			msrp=response.get('data').get('msrp'), 
			sprint=response.get('data').get('sprint', ''), 
			label=response.get('data').get('label', ''), 
			pcr_estimate=response.get('data').get('pcr_estimate', ''),
			epic_link=response.get('data').get('epic_link', ''),
			override=True
		)
	else:
		chat_obj.send_meeting_message(message=data['message'], chatroom=data['username'])
	
	return {'status': True}


def _get_jira_ticket_for_ping(data):
	"""Gets required Jira information for a ping message generation."""
	missing_params = missing_parameters(params=data, required=['cred_hash', 'key'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	jira_obj = Jira()

	jira_response = jira_obj.get_full_ticket(cred_hash=data['cred_hash'] , key=data['key'])
	if not jira_response['status'] or len(jira_response['data']) == 0:
		return {"data": f"could not get Jira ticket: "+{jira_response['data']}, "status": False}

	data = jira_response['data'][0]
	data['pcr_estimate'] = jira_obj.get_pcr_estimate(story_point=data['story_point'])

	return {"data": data, "status": True}


def send_pcr_comments(data):
	"""Send a PCR comments needing addressed to a user."""
	missing_params = missing_parameters(params=data, required=['fromName', 'toUsername', 'pullLinks', 'key'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	chat_obj = Chat()
	
	return chat_obj.send_pcr_comments(
		fromName=data['fromName'], 
		toUsername=data['toUsername'], 
		pullLinks=data['pullLinks'], 
		key=data['key']
	)