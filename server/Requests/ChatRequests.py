#!/usr/bin/python3

from ..FlaskUtils import missing_parameters
from ..Jira.Jira import Jira
from ..Chat.Chat import Chat
from ..SQL.DevCenterSQL import DevCenterSQL


def send_ping(data, dev_chat, no_pings):
	'''sends a ping to the chatroom
	'''
	missing_params = missing_parameters(params=data, required=['username', 'ping_type','cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	
	chat_obj = Chat(debug=dev_chat, no_pings=no_pings)
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
			key=data['key'], msrp=data['msrp'], summary=data['summary'], 
			username=username, story_point=data['story_point'], 
			pcr_estimate=pcr_estimate
		)

	elif data['ping_type'] == 'merge':
		return chat_obj.send_merge_needed( 
			key=data['key'], msrp=data['msrp'], summary=data['summary'], 
			username=username, sprint=data['sprint']
		)

	else:
		return {"data": "Ping reset not implemented", "status": False}
	
def set_user_pings(data, devdb, sql_echo):
	'''sets a user's ping settings
	'''
	missing_params = missing_parameters(params=data, required=['username', 'fields'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	
	sql_obj = DevCenterSQL(devdb=devdb, sql_echo=sql_echo)
	response = sql_obj.set_user_pings(
		username=data['username'],
		fields=data['fields']
	)

	return response

def send_custom_ping(data, dev_chat, no_pings):
	'''send a custom ping to chatroom or a generated one from a ticket status transition
	'''
	missing_params = missing_parameters(params=data, required=['ping_type', 'cred_hash'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	chat_obj = Chat(debug=dev_chat, no_pings=no_pings)

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
			sprint=response.get('data').get('sprint'), 
			label=response.get('data').get('label'), 
			pcr_estimate=response.get('data').get('pcr_estimate'),
			override=True
		)
	else:
		chat_obj.send_meeting_message(message=data['message'], chatroom=data['username'])
	
	return {'status': True}


def _get_jira_ticket_for_ping(data):
	'''gets required Jira information for a ping message generation
	'''
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

def send_pcr_comments(data, dev_chat, no_pings):
	missing_params = missing_parameters(params=data, required=['fromName', 'toUsername', 'pullLinks', 'key'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	chat_obj = Chat(debug=dev_chat, no_pings=no_pings)
	
	return chat_obj.send_pcr_comments(
		fromName=data['fromName'], 
		toUsername=data['toUsername'], 
		pullLinks=data['pullLinks'], 
		key=data['key']
	)
