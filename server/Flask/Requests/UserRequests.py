#!/usr/bin/python3

from ..FlaskUtils import check_parameters

def get_navbar_items(sql_obj):
	session = sql_obj.login()
	data = sql_obj.get_navbar_items(session)
	sql_obj.logout(session)

	return {
		'status': True,
		'data': data
	}

def set_navbar_item(sql_obj, data):
	item = {
		'id': data.get('id', ''),
		'name': data.get('name', ''),
		'type': data.get('type', ''),
		'link': data.get('link', '')
	}

	missing_params = check_parameters(params=item, required=['id', 'name', 'type', 'link'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}

	session = sql_obj.login()
	response = sql_obj.set_navbar_item(session=session, item=item)
	sql_obj.logout(session)
	return response
