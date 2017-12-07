#!/usr/bin/python3

from flask import request, Response
from flask_cors import cross_origin

import Requests.CommonRequests as CommonRequests

def define_routes(app, app_name, sql_object, g):
	'''
	'''

	@app.route(f'/{app_name}/chat/set_ping', methods=['POST'])
	@cross_origin()
	def update_ping():
		post_data = request.get_json()
		data = {
			"cred_hash": g.cred_hash,
			"key": post_data.get('key', ''),
			"field": post_data.get('field', ''),
			"value": post_data.get('value', '')
		}

		data = CommonRequests.update_ping(data=data, sql_object=sql_object)
		return Response(data, mimetype='application/json')