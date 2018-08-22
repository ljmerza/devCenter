#!/usr/bin/python3

from flask import Response, request
from flask_cors import cross_origin

from ..Requests.UserRequests import set_navbar_item, get_navbar_items, get_jql_links
from ..Requests.JiraRequests import get_profile

def define_routes(app, app_name, g, devdb, sql_echo):

	@app.route(f'/{app_name}/jira/profile/<username>')
	@cross_origin()
	def get_profile_route(username):
		data = {"cred_hash": g.cred_hash, "username": username}
		data = get_profile(data=data)
		return Response(data, mimetype='application/json')

	@app.route(f'/{app_name}/navbar', methods=['GET', 'POST'])
	@cross_origin()
	def get_navbar():
		response = {'status': False, 'data': ''}

		if request.method == 'POST':
			data = request.get_json()
			response = set_navbar_item(data=data.get('item', {}))
		else:
			response = get_navbar_items(devdb=devdb, sql_echo=sql_echo)

		return Response(response, mimetype='application/json')

	@app.route(f'/{app_name}/jql_links', methods=['GET'])
	@cross_origin()
	def get_jql_links_route():
		response = get_jql_links(devdb=devdb, sql_echo=sql_echo)
		return Response(response, mimetype='application/json')
