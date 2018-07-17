#!/usr/bin/python3

from ..FlaskUtils import missing_parameters
from ..SQL.DevCenterSQL import DevCenterSQL

def get_navbar_items(devdb, sql_echo):
	'''gets all navbar items
	'''
	sql_obj = DevCenterSQL(devdb=devdb, sql_echo=sql_echo)

	session = sql_obj.login()
	data = sql_obj.get_navbar_items(session)
	sql_obj.logout(session)

	return {'status': True,'data': data}

def set_navbar_item(data):
	'''sets a new navbar item or edits a current one
	'''
	item = {
		'id': data.get('id', ''),
		'name': data.get('name', ''),
		'type': data.get('type', ''),
		'link': data.get('link', '')
	}

	if missing_parameters(params=item, required=['id', 'name', 'type', 'link']):
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	session = sql_obj.login()
	response = sql_obj.set_navbar_item(session=session, item=item)
	sql_obj.logout(session)
	
	return response
