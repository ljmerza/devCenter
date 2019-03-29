#!/usr/bin/python3

from FlaskUtils import missing_parameters
from SQL.DevCenterSQL import DevCenterSQL

def get_navbar_items(devdb, sql_echo):
	'''gets all navbar items
	'''
	sql_obj = DevCenterSQL(devdb=devdb, sql_echo=sql_echo)
	return {
		'status': True,
		'data': sql_obj.get_navbar_items()
	}

def get_statuses(devdb, sql_echo):
	'''gets all navbar items
	'''
	sql_obj = DevCenterSQL(devdb=devdb, sql_echo=sql_echo)
	return {
		'status': True,
		'data': sql_obj.get_statuses()
	}

def get_ticket_history(devdb, sql_echo):
	'''gets all navbar items
	'''
	sql_obj = DevCenterSQL(devdb=devdb, sql_echo=sql_echo)
	return {
		'status': True,
		'data': sql_obj.get_ticket_history()
	}

def get_jql_links(devdb, sql_echo):
	'''gets all navbar items
	'''
	sql_obj = DevCenterSQL(devdb=devdb, sql_echo=sql_echo)
	return {
		'status': True,
		'data': sql_obj.get_jql_links()
	}

def set_navbar_item(data):
	'''sets a new navbar item or edits a current one
	'''
	item = {
		'id': data.get('id', ''),
		'name': data.get('name', ''),
		'type': data.get('type', ''),
		'link': data.get('link', '')
	}

	missing_params = missing_parameters(params=item, required=['id', 'name', 'type', 'link'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	return sql_obj.set_navbar_item(item=item)
