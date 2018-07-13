#!/usr/bin/python3

from flask import Response
from flask_cors import cross_origin

from ..Requests.ApiRequests import get_orders as ApiRequests_get_orders

def define_routes(app, app_name, order_object):
	@app.route(f'/{app_name}/api/orders')
	@cross_origin()
	def get_orders():
		response = ApiRequests_get_orders(order_object=order_object)
		return Response(response, mimetype='application/json')
