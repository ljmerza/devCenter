#!/usr/bin/python3

from flask import request, Response
from flask_cors import cross_origin

from Requests.ChatRequests import send_ping, set_user_pings, send_custom_ping, send_pcr_comments

def define_routes(app, app_name, g, devdb, sql_echo, dev_chat, no_pings, **kwargs):
	
	@app.route(f'/{app_name}/chat/send_ping', methods=['POST'])
	@cross_origin()
	def send_ping_route():
		post_data = request.get_json()
		post_data['cred_hash'] = g.cred_hash

		response = send_ping(data=post_data, dev_chat=dev_chat, no_pings=no_pings)
		return Response(response, mimetype='application/json')

	@app.route(f'/{app_name}/chat/user_pings', methods=['POST'])
	@cross_origin()
	def user_pings():

		post_data = request.get_json()
		post_data['cred_hash'] = g.cred_hash

		response = set_user_pings(data=post_data, devdb=devdb, sql_echo=sql_echo)
		return Response(response, mimetype='application/json')

	@app.route(f'/{app_name}/chat/custom_ping', methods=['POST'])
	@cross_origin()
	def send_custom_ping_route():
		post_data = request.get_json()
		post_data['cred_hash'] = g.cred_hash
		
		response = send_custom_ping(data=post_data, dev_chat=dev_chat, no_pings=no_pings)
		return Response(response, mimetype='application/json')

	@app.route(f'/{app_name}/chat/send_pcr_comments', methods=['POST'])
	@cross_origin()
	def send_pcr_comments_route():
		post_data = request.get_json()
		response = send_pcr_comments(data=post_data, dev_chat=dev_chat, no_pings=no_pings)
		return Response(response, mimetype='application/json')
