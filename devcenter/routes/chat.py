"""Creates all chat based routes."""
import os

from flask import request, Response
from flask_cors import cross_origin

from devcenter.requests.chat import send_ping, set_user_pings, send_custom_ping, send_pcr_comments


def define_routes(app, g):
	"""Creates all chat based routes."""
	APP_NAME = os.environ['APP_NAME']
	
	@app.route(f'/{APP_NAME}/chat/send_ping', methods=['POST'])
	@cross_origin()
	def send_ping_route():
		post_data = request.get_json()
		post_data['cred_hash'] = g.cred_hash
		response = send_ping(data=post_data)
		return Response(response, mimetype='application/json')

	@app.route(f'/{APP_NAME}/chat/user_pings', methods=['POST'])
	@cross_origin()
	def user_pings():
		post_data = request.get_json()
		post_data['cred_hash'] = g.cred_hash
		response = set_user_pings(data=post_data)
		return Response(response, mimetype='application/json')

	@app.route(f'/{APP_NAME}/chat/custom_ping', methods=['POST'])
	@cross_origin()
	def send_custom_ping_route():
		post_data = request.get_json()
		post_data['cred_hash'] = g.cred_hash
		response = send_custom_ping(data=post_data)
		return Response(response, mimetype='application/json')

	@app.route(f'/{APP_NAME}/chat/send_pcr_comments', methods=['POST'])
	@cross_origin()
	def send_pcr_comments_route():
		post_data = request.get_json()
		post_data['cred_hash'] = g.cred_hash
		response = send_pcr_comments(data=post_data)
		return Response(response, mimetype='application/json')
