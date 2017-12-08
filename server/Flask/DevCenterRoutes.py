#!/usr/bin/python3

from flask import request, Response, g, abort
from flask_cors import cross_origin
import requests
import json

import Requests.JiraRequests
import Requests.CrucibleRequests
import Requests.ChatRequests

import Routes.JiraRoutes
import Routes.CrucibleRoutes
import Routes.GitRoutes
import Routes.ChatRoutes

def define_routes(app, devflk, socketio, app_name, jira_obj, crucible_obj, sql_obj, chat_obj):
	'''
	'''

	Routes.JiraRoutes.define_routes(app=app, app_name=app_name, jira_obj=jira_obj, crucible_obj=crucible_obj, g=g)
	Routes.CrucibleRoutes.define_routes(app=app, app_name=app_name, jira_obj=jira_obj, crucible_obj=crucible_obj, g=g)
	Routes.GitRoutes.define_routes(app=app, app_name=app_name, crucible_obj=crucible_obj, g=g)
	Routes.ChatRoutes.define_routes(app=app, app_name=app_name, chat_obj=chat_obj, jira_obj=jira_obj, crucible_obj=crucible_obj, g=g)


	@app.route(f"/{app_name}/socket_tickets", methods=['POST'])
	@cross_origin()
	def socket_tickets():
		'''
		'''
		socketio.emit('update_tickets', request.get_json())
		return Response(status=200)


	@app.before_request
	def get_cred_hash():
		'''
		'''
		# print url if in dev mode
		if devflk:
			print(request.url)

		# if web sockets then ignore
		if 'socket_tickets' not in request.url:
			cred_hash = request.headers.get('Authorization')

			# if POST request and we dont have creds then just abort request
			if not cred_hash:
				abort(401)
			else:
				# set creds to global object
				g.cred_hash = cred_hash


	@app.after_request
	def check_status(response):
		'''
		'''

		# if preflight then just accept
		if request.method == 'OPTIONS' or 'socket_tickets' in request.url:
			return Response(status=200)

		# if 
		if response.status_code == 401:
			return Response(json.dumps({'status': False, 'data': 'Invalid username and/or password'}), status=401, mimetype='application/json')
		
		status=200
		# if we have response data then overwrite data
		if len(response.response):
			data = json.dumps(response.response)

			# check manual status
			if not response.response['status']:
				status=404
			# return status and data
			return Response(data, status=status, mimetype='application/json')