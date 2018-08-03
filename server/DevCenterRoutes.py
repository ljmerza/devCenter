#!/usr/bin/python3
import json
import os

from flask import request, Response, g, abort
from flask_cors import cross_origin
import requests

from .AESCipher import AESCipher
from .Routes.JiraRoutes import define_routes as JiraRoutes_define_routes
from .Routes.ChatRoutes import define_routes as ChatRoutes_define_routes
from .Routes.UserRoutes import define_routes as UserRoutes_define_routes
from .Routes.ApiRoutes import define_routes as ApiRoutes_define_routes
from .Routes.CodeCloudRoutes import define_routes as CodeCloudRoutes_define_routes


def define_routes(app, devflk, socketio, app_name, devdb, sql_echo, dev_chat, no_pings):

	key = os.environ['ENCRYPT_KEY']
	cypher = AESCipher(key=key)

	JiraRoutes_define_routes(app=app, app_name=app_name, g=g)
	CodeCloudRoutes_define_routes(app=app, app_name=app_name, g=g)
	ChatRoutes_define_routes(app=app, app_name=app_name, g=g, devdb=devdb, sql_echo=sql_echo, dev_chat=dev_chat, no_pings=no_pings)
	UserRoutes_define_routes(app=app, app_name=app_name, g=g, devdb=devdb, sql_echo=sql_echo)
	ApiRoutes_define_routes(app=app, app_name=app_name)

	@app.route(f"/{app_name}/socket_tickets", methods=['POST'])
	@cross_origin()
	def socket_tickets():
		socketio.emit('update_tickets', request.get_json())
		return Response(status=200)

	@app.route(f"/{app_name}/encrypt", methods=['POST'])
	@cross_origin()
	def encrypt_token():
		data = {'status': True, 'data': cypher.encrypt(g.cred_hash)}
		return Response(data, mimetype='application/json')

	@app.before_request
	def get_cred_hash():
		# print url if in dev mode
		if devflk:
			print(request.url)

		# if web sockets then ignore
		if 'socket_tickets' not in request.url:
			cred_hash = request.headers.get('Authorization')

			# if POST request and we dont have creds then just abort request
			# else decrypt password and save on global request
			if not cred_hash:
				abort(401)
			else:
				g.cred_hash = cypher.decrypt(g.cred_hash)

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
