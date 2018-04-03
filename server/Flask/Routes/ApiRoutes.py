#!/usr/bin/python3

from flask import Response
from flask_cors import cross_origin

import Requests.ApiRequests as ApiRequests

def define_routes(app, app_name, order_object):
	'''
	'''

	@app.route(f'/{app_name}/api/orders')
	@cross_origin()
	def get_orders():
		response = ApiRequests.get_orders()
		return Response(response, mimetype='application/json')