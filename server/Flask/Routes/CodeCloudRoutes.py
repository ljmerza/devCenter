#!/usr/bin/python3

from flask import Response
from flask_cors import cross_origin

from ..Requests.CodeCloudRequests import get_repos, get_branches, ticket_branches as CCRequests_ticket_branches

def define_routes(app, app_name, code_cloud_obj, g):

	@app.route(f'/{app_name}/git/repos')
	@cross_origin()
	def repos():
		data = get_repos(data={
			"cred_hash": g.cred_hash
		}, code_cloud_obj=code_cloud_obj)
		return Response(data, mimetype='application/json')

	@app.route(f'/{app_name}/git/repo/<repo_name>')
	@cross_origin()
	def branches(repo_name):
		data = get_branches(data={
			"repo_name": repo_name,
			"cred_hash": g.cred_hash
		}, code_cloud_obj=code_cloud_obj)
		return Response(data, mimetype='application/json')

	@app.route(f'/{app_name}/git/branches/<msrp>')
	@cross_origin()
	def ticket_branches(msrp):
		data = CCRequests_ticket_branches(data={
			"msrp": msrp,
			"cred_hash": g.cred_hash
		}, code_cloud_obj=code_cloud_obj)
		return Response(data, mimetype='application/json')
