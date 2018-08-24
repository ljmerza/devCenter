#!/usr/bin/python3

from flask import Response
from flask_cors import cross_origin

from ..Requests.ApiRequests import get_orders, get_atx

def define_routes(app, app_name):
	
	@app.route(f'/{app_name}/skipcreds/json_api/orders')
	@cross_origin()
	def get_orders_route():
		response = get_orders()
		return Response(response, mimetype='application/json')

	@app.route(f'/{app_name}/skipcreds/json_api/atx')
	@cross_origin()
	def get_atx_route():
		response = get_atx()
		return Response(response, mimetype='application/json')
