#!/usr/bin/python3

from flask import Response
from flask_cors import cross_origin

import Requests.UserRequests as UserRequests
import Requests.JiraRequests as JiraRequests

def define_routes(app, app_name, jira_obj, sql_obj, g):

	@app.route(f'/{app_name}/jira/profile/<username>')
	@cross_origin()
	def get_profile(username):
		'''
		'''
		data = {
			"cred_hash": g.cred_hash,
			"username": username
		}
		data = JiraRequests.get_profile(data=data, jira_obj=jira_obj, sql_obj=sql_obj)
		return Response(data, mimetype='application/json')

	@app.route(f'/{app_name}/navbar')
	@cross_origin()
	def get_navbar():
		'''
		'''
		data = UserRequests.get_navbar_items(sql_obj=sql_obj)
		return Response(data, mimetype='application/json')