#!/usr/bin/python3

from Flask import FlaskUtils

def update_ping(data, sql_object):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['key','field','value'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# set ping
	session = sql_object.login()
	response = sql_object.update_ping(key=data['key'], field=data['field'], value=data['value'], session=session)
	sql_object.logout(session=session)
	print('---',response)
	# return response
	return response

def get_user_ping_values(self, data, sql_object):
	'''
	'''
	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['username'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	# set ping
	session = sql_object.login()
	response = sql_object.get_user_ping_values(username=data['username'], session=session)
	sql_object.logout(session=session)

	# return response
	return response

def set_user_ping_value(self, username, field, value, sql_object):
	'''
	'''
	missing_params = FlaskUtils.check_args(params=data, required=['username','field','value'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	session = sql_object.login()
	response = sql_object.set_user_ping_value(username=data['username'], field=data['field'], value=data['value'], session=session)
	sql_object.logout(session=session)

	# return response
	return response
