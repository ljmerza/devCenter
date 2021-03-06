"""Creates all api based routes."""
import os

from flask import Response
from flask_cors import cross_origin

from devcenter.requests.api import get_orders, get_atx


def define_routes(app, g):
	"""Creates all api based routes."""
	try:
		APP_NAME = os.environ['APP_NAME']
	except KeyError:
		APP_NAME = ''
	
	@app.route(f'/{APP_NAME}/skipcreds/json_api/orders')
	@cross_origin()
	def get_orders_route():
		response = get_orders()
		return Response(response, mimetype='application/json')

	@app.route(f'/{APP_NAME}/skipcreds/json_api/atx')
	@cross_origin()
	def get_atx_route():
		response = get_atx()
		return Response(response, mimetype='application/json')
