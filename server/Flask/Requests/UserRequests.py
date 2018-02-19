#!/usr/bin/python3

from Flask import FlaskUtils

def get_navbar_items(sql_obj):
	'''
	'''

	session = sql_obj.login()
	data = sql_obj.get_navbar_items(session)
	sql_obj.logout(session)

	return {
		'status': True,
		'data': data
	}