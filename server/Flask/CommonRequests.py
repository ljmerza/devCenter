#!/usr/bin/python3

from Flask import FlaskUtils

def update_ping(data, sql_object):

	# check for required data
	missing_params = FlaskUtils.check_args(params=data, required=['key','field','value','cred_hash'])
	if missing_params:
		return {"data": "Missing required parameters: "+ missing_params, "status": False}

	# set ping
	session = sql_object.login()
	response = sql_object.update_ping(key=data['key'], field=data['field'], value=data['value'], session=session)
	sql_object.logout(session=session)

	# return response
	return response

