#!/usr/bin/python3

from flask import Response
from flask_cors import cross_origin

import Requests.CrucibleRequests as CrucibleRequests

def define_routes(app, app_name, crucible_obj, g):
	'''
	'''

	@app.route(f'/{app_name}/git/repos')
	@cross_origin()
	def repos():
		'''Gets all repos a user can access in fisheye

		Args:
			None

		Returns:
			All repos a user can access
		'''
		data = CrucibleRequests.get_repos(data={
			"cred_hash": g.cred_hash
		}, crucible_obj=crucible_obj)
		return Response(data, mimetype='application/json')


	@app.route(f'/{app_name}/git/repo/<repo_name>')
	@cross_origin()
	def branches(repo_name):
		'''gets all branches of a repo

		Args:
			repo_name (str) the name if the repo to get all the branches from

		Returns:
			a list of bracnhes names
		'''
		data = CrucibleRequests.get_branches(data={
			"repo_name": repo_name, 
			"cred_hash": g.cred_hash
		}, crucible_obj=crucible_obj)
		return Response(data, mimetype='application/json')



	@app.route(f'/{app_name}/git/branches/<msrp>')
	@cross_origin()
	def ticket_branches(msrp):
		'''returns all branches tied to a Jira MSRP

		Args:
			msrp (str) the MSRP to search for in the branch names

		Returns:
			
		'''
		data = CrucibleRequests.ticket_branches(data={
			"msrp": msrp,
			"cred_hash": g.cred_hash
		}, crucible_obj=crucible_obj)
		return Response(data, mimetype='application/json')