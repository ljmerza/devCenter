#!/usr/bin/python3

from flask import Flask, render_template, jsonify, send_from_directory, request, Response, g,abort
from flask_cors import CORS, cross_origin

import os
import json
import requests
import sys
import base64

import JiraRequests
import CrucibleRequests


def start_server(host, app, socketio, jira_obj, crucible_obj):

	app_name = 'dev_center'
	port = 5858


	@app.before_request
	def get_cred_hash():
		'''
		'''
		cred_hash = request.headers.get('Authorization')

		# if POST request and we dont have creds then just abort request
		if request.method == 'POST' and not cred_hash:
			abort(401)

		elif request.method == 'GET':
			# if user didn't supply password then use mine for retrieving data
			if not cred_hash:
				username = os.environ['USER']
				password = os.environ['PASSWORD']
				header_value = f'{username}:{password}'
				encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
				cred_hash = f'Basic {encoded_header}'

		# set creds to global object
		g.cred_hash = cred_hash


	@app.after_request
	def check_status(response):
		'''
		'''
		status = 200
		if len(response.response):
			if not response.response['status']:
				status=404
		return Response(json.dumps(response.response), status=status, mimetype='application/json')


	@app.route(f"/{app_name}/jira/tickets")
	@cross_origin()
	def jiraTickets():
		'''gets a list of formatted Jira tickets given a filter number or URL (adds the Crucible IDs if it can)

		Args:
			filter_number (str) the filter number to get tickets from ( query string param)
			fields (str) the fields to get from the Jira ticket ( query string param)
			jql (str) the JQL to use to get Jira tickets from ( query string param)

		Returns:
			the server response JSON object with status/data properties
		'''
		data = JiraRequests.get_jira_tickets(data={
			"filter_number": request.args.get('filter'),
			"jql": request.args.get('jql'),
			"fields": request.args.get('fields'),
			"cred_hash": g.cred_hash
		}, jira_obj=jira_obj)
		return Response(data, mimetype='application/json')


	@app.route(f'/{app_name}/jira/getkey/<msrp>')
	@cross_origin()
	def getKey(msrp):
		'''gets a Jira key from a MSRP number

		Args:
			msrp (str) the MSRP number of the Jira ticket

		Returns:
			the server response JSON object with status/data properties
		'''
		data = JiraRequests.find_key_by_msrp(data={
			"msrp": msrp,
			"cred_hash": g.cred_hash
		}, jira_obj=jira_obj)
		return Response(data, mimetype='application/json')


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


	@app.route(f'/{app_name}/crucible/review/create', methods=['POST'])
	@cross_origin()
	def crucible_create_review():
		'''creates a Crucible review with the proper header and branches passed in the body of the request

		Args:
			

		Returns:
			the Crucible ID number if successful else error
		'''
		data=request.get_json()
		data["cred_hash"] = g.cred_hash
		response = CrucibleRequests.crucible_create_review(data=data, crucible_obj=crucible_obj, jira_obj=jira_obj)
		# if crucible errored out then return error
		if not response['status']:
			return jsonify(response)

		# if we have qa steps then make Jira changes too
		if 'qa_steps' in data and data['qa_steps']:

			data['crucible_id'] = response['data']['crucible_id']
			data['key'] = response['data']['key']

			response = JiraRequests.transition_to_cr(data=data, jira_obj=jira_obj)

		# return whatever response jira made
		return Response(response, mimetype='application/json')


	@app.route(f'/{app_name}/crucible/review/pcr_pass', methods=['POST'])
	@cross_origin()
	def crucible_pcr_pass():
		'''Joins user to a review, completes review, and adds a PCR Pass comment

		Args:
			crucible_id (str) the Crucible ID to PCR pass
			username (str) the user to add to the review

		Returns:
			status ok or fail reason
		'''
		# get POST data
		post_data = request.get_json()
		data = {
			"cred_hash": g.cred_hash,
			"username": post_data.get('username', ''),
			"crucible_id": post_data.get('crucible_id', '')
		}
		# make POST call and return result
		data = CrucibleRequests.set_pcr_pass(data=data, crucible_obj=crucible_obj)
		return Response(data, mimetype='application/json')


	@app.route(f'/{app_name}/crucible/review/pcr_complete', methods=['POST'])
	@cross_origin()
	def crucible_pcr_complete():
		'''Sets the Jira component as PCR - Complete

		Args:
			key (str) the Jira ticket key to PCR Complete
			username (str) the user to add to the review

		Returns:
			status ok or fail reason
		'''
		# get POST data
		post_data = request.get_json()
		data = {
			"cred_hash": g.cred_hash,
			"key": post_data.get('key', ''),
			"username": post_data.get('username', '')
		}

		# make POST call and return result
		data = JiraRequests.set_pcr_complete(data=data, jira_obj=jira_obj)
		return Response(data, mimetype='application/json')



	# start server
	socketio.run(app, host=host, port=port)