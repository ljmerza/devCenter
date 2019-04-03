"""Creates all user based routes."""
import os

from flask import Response, request
from flask_cors import cross_origin

from devcenter.requests.user import (
	set_navbar_item, get_navbar_items,
	get_jql_links, get_statuses, get_ticket_history
)
from devcenter.requests.jira import get_profile


def define_routes(app, g):
	"""Creates all user based routes."""
	APP_NAME = os.environ['APP_NAME']

	@app.route(f'/{APP_NAME}/jira/profile/<username>')
	@cross_origin()
	def get_profile_route(username):
		data = {"cred_hash": g.cred_hash, "username": username}
		data = get_profile(data=data)
		return Response(data, mimetype='application/json')

	@app.route(f'/{APP_NAME}/skipcreds/navbar', methods=['GET', 'POST'])
	@cross_origin()
	def get_navbar():
		response = {'status': False, 'data': ''}

		if request.method == 'POST':
			data = request.get_json()
			response = set_navbar_item(data=data.get('item', {}))
		else:
			response = get_navbar_items()

		return Response(response, mimetype='application/json')

	@app.route(f'/{APP_NAME}/skipcreds/jql_links', methods=['GET'])
	@cross_origin()
	def get_jql_links_route():
		response = get_jql_links()
		return Response(response, mimetype='application/json')

	@app.route(f'/{APP_NAME}/skipcreds/statuses', methods=['GET'])
	@cross_origin()
	def get_statuses_request():
		response = get_statuses()
		return Response(response, mimetype='application/json')

	@app.route(f'/{APP_NAME}/skipcreds/ticket_history', methods=['GET'])
	@cross_origin()
	def get_ticket_history_request():
		response = get_ticket_history()
		return Response(response, mimetype='application/json')
