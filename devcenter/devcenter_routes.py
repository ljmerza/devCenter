"""Creates all routes for devcenter."""
import json
import os
from base64 import b64encode

from flask import request, Response, g, abort
from flask_cors import cross_origin
import requests

from .aes_cipher import AESCipher
from .routes.jira import define_routes as JiraRoutes_define_routes
from .routes.chat import define_routes as ChatRoutes_define_routes
from .routes.user import define_routes as UserRoutes_define_routes
from .routes.api import define_routes as ApiRoutes_define_routes
from .routes.codecloud import define_routes as CodeCloudRoutes_define_routes
from .server_utils import generate_cred_hash


def define_routes(app, socketio):
	"""Creates all routes for devcenter."""
	key = os.environ.get('ENCRYPT_KEY')
	APP_NAME = os.environ.get('APP_NAME')
	print_routes = int(os.environ.get('PRINT_ROUTES', 0))

	cypher = AESCipher(key=key)

	JiraRoutes_define_routes(app=app, g=g)
	CodeCloudRoutes_define_routes(app=app, g=g)
	ChatRoutes_define_routes(app=app, g=g)
	UserRoutes_define_routes(app=app, g=g)
	ApiRoutes_define_routes(app=app, g=g)


	@app.route(f"/{APP_NAME}/socket_tickets", methods=['POST'])
	@cross_origin()
	def socket_tickets():
		socketio.emit('update_tickets', request.get_json())
		return Response(status=200)


	@app.route(f"/{APP_NAME}/skipcreds/encrypt", methods=['POST'])
	@cross_origin()
	def encrypt_token():
		post_data = request.get_json()

		if not post_data.get('password', False):
			data = {'status': False, 'data': 'No password given.'}
		try:
			encrypted_password = cypher.encrypt(post_data['password'])
			data = {'status': True, 'data': encrypted_password}
		except Error as err:
			data = {'status': False, 'data': f'Could not encrypt password: {err}.'}

		return Response(data, mimetype='application/json')


	@app.before_request
	def get_cred_hash():
		if print_routes: print(request.url)

		# if web sockets or encrypting password then ignore
		if('socket_tickets' not in request.url and 'skipcreds' not in request.url):
			cred_hash = request.headers.get('x-token')

			try:
				username, password = cred_hash.strip().split(':')
				decrypted_pasword = cypher.decrypt(password)
				g.cred_hash = generate_cred_hash(username=username, password=decrypted_pasword)
			except:
				abort(401)


	@app.after_request
	def check_status(response):
		# if preflight then just accept
		if request.method == 'OPTIONS' or 'socket_tickets' in request.url:
			return Response(status=200)

		# if 401 then invalid password
		if response.status_code == 401:
			return Response(json.dumps({'status': False, 'data': 'Invalid username and/or password'}), status=401, mimetype='application/json')

		if response.status_code == 404:
			return Response(json.dumps({'status': False, 'data': 'API route not found'}), status=401, mimetype='application/json')

		status = 200

		# if we have response data then overwrite data
		if response and len(response.response):
			data = json.dumps(response.response)
			if not response.response['status']: status = 404
			return Response(data, status=status, mimetype='application/json')
		else:
			return Response({'status': False, 'data': f'Invalid response {response}'}, status=500, mimetype='application/json')
