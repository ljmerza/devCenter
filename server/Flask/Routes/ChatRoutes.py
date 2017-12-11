#!/usr/bin/python3

from flask import request, Response
from flask_cors import cross_origin

import Requests.ChatRequests as ChatRequests

def define_routes(app, app_name, chat_obj, jira_obj, crucible_obj, g):
	'''
	'''

	@app.route(f'/{app_name}/chat/send_ping', methods=['POST'])
	@cross_origin()
	def send_ping():
		post_data = request.get_json()
		post_data['cred_hash'] = g.cred_hash

		response = ChatRequests.send_ping(data=post_data, chat_obj=chat_obj, jira_obj=jira_obj, crucible_obj=crucible_obj)
		return Response(response, mimetype='application/json')