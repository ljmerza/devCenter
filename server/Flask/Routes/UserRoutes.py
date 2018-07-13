#!/usr/bin/python3

from flask import Response, request
from flask_cors import cross_origin

from ..Requests.UserRequests import set_navbar_item, get_navbar_items
from ..Requests.JiraRequests import get_profile as JiraRequests_get_profile

def define_routes(app, app_name, jira_obj, sql_obj, g):

	@app.route(f'/{app_name}/jira/profile/<username>')
	@cross_origin()
	def get_profile(username):
		data = {
			"cred_hash": g.cred_hash,
			"username": username
		}
		data = JiraRequests_get_profile(data=data, jira_obj=jira_obj, sql_obj=sql_obj)
		return Response(data, mimetype='application/json')

	@app.route(f'/{app_name}/navbar', methods=['GET', 'POST'])
	@cross_origin()
	def get_navbar():
		response = {'status': False, 'data': ''}

		if request.method == 'POST':
			data = request.get_json()
			response = set_navbar_item(sql_obj=sql_obj, data=data.get('item', {}))

		else:
			response = get_navbar_items(sql_obj=sql_obj)

		return Response(response, mimetype='application/json')
