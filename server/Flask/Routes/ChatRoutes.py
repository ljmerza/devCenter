#!/usr/bin/python3

from flask import request, Response
from flask_cors import cross_origin

import Requests.ChatRequests as ChatRequests

def define_routes(app, app_name, chat_obj, jira_obj, crucible_obj, sql_obj, g):
	'''
	'''

	@app.route(f'/{app_name}/chat/send_ping', methods=['POST'])
	@cross_origin()
	def send_ping():
		post_data = request.get_json()
		post_data['cred_hash'] = g.cred_hash

		response = ChatRequests.send_ping(data=post_data, chat_obj=chat_obj, jira_obj=jira_obj, crucible_obj=crucible_obj)
		return Response(response, mimetype='application/json')

	@app.route(f'/{app_name}/chat/user_pings', methods=['POST'])
	@cross_origin()
	def user_pings():

		post_data = request.get_json()
		post_data['cred_hash'] = g.cred_hash

		response = ChatRequests.set_user_pings(data=post_data, sql_obj=sql_obj)
		return Response(response, mimetype='application/json')

	@app.route(f'/{app_name}/chat/custom_ping', methods=['POST'])
	@cross_origin()
	def send_custom_ping():
		post_data = request.get_json()
		post_data['cred_hash'] = g.cred_hash
		
		response = ChatRequests.send_custom_ping(data=post_data, chat_obj=chat_obj, crucible_obj=crucible_obj, jira_obj=jira_obj)
		return Response(response, mimetype='application/json')