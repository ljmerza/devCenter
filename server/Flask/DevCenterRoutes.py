#!/usr/bin/python3

from flask import request, Response, g, abort
from flask_cors import cross_origin
import requests
import json

from .Routes.JiraRoutes import define_routes as JiraRoutes_define_routes
from .Routes.CrucibleRoutes import define_routes as CrucibleRoutes_define_routes
from .Routes.ChatRoutes import define_routes as ChatRoutes_define_routes
from .Routes.UserRoutes import define_routes as UserRoutes_define_routes
from .Routes.ApiRoutes import define_routes as ApiRoutes_define_routes
from .Routes.CodeCloudRoutes import define_routes as CodeCloudRoutes_define_routes


def define_routes(app, devflk, socketio, app_name, jira_obj, crucible_obj, sql_obj, chat_obj, order_object, code_cloud_obj):

	JiraRoutes_define_routes(app=app, app_name=app_name, jira_obj=jira_obj, crucible_obj=crucible_obj, sql_obj=sql_obj, g=g, code_cloud_obj=code_cloud_obj)

	CrucibleRoutes_define_routes(app=app, app_name=app_name, jira_obj=jira_obj, crucible_obj=crucible_obj, g=g, code_cloud_obj=code_cloud_obj)

	CodeCloudRoutes_define_routes(app=app, app_name=app_name, code_cloud_obj=code_cloud_obj, g=g)

	ChatRoutes_define_routes(app=app, app_name=app_name, chat_obj=chat_obj, jira_obj=jira_obj, crucible_obj=crucible_obj, sql_obj=sql_obj, g=g)

	UserRoutes_define_routes(app=app, app_name=app_name, jira_obj=jira_obj, sql_obj=sql_obj, g=g)

	ApiRoutes_define_routes(app=app, app_name=app_name, order_object=order_object)


	@app.route(f"/{app_name}/socket_tickets", methods=['POST'])
	@cross_origin()
	def socket_tickets():
		socketio.emit('update_tickets', request.get_json())
		return Response(status=200)


	@app.before_request
	def get_cred_hash():
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
		# if preflight then just accept
		if request.method == 'OPTIONS' or 'socket_tickets' in request.url:
			return Response(status=200)

		# if 401 then invalid password
		if response.status_code == 401:
			return Response(json.dumps({'status': False, 'data': 'Invalid username and/or password'}), status=401, mimetype='application/json')
		status=200
		# if we have response data then overwrite data
		if response and len(response.response):
			data = json.dumps(response.response)

			# check manual status
			if not response.response['status']:
				status=404
			# return status and data
			return Response(data, status=status, mimetype='application/json')
