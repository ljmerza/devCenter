#!/usr/bin/python3

from flask import request, Response, g, abort
from flask_cors import cross_origin
import requests
import json

import JiraRequests
import CrucibleRequests
import CommonRequests

def define_routes(app, socketio, app_name, jira_obj, crucible_obj, sql_object):
	'''
	'''

	@app.route(f"/{app_name}/socket_tickets", methods=['POST'])
	@cross_origin()
	def socket_tickets():
		'''
		'''
		socketio.emit('update_tickets', request.get_json())
		return Response(status=200)


	@app.before_request
	def get_cred_hash():
		'''
		'''
		# if web sockets then ignore
		if 'socket_tickets' not in request.url:
			cred_hash = request.headers.get('Authorization')

			# if POST request and we dont have creds then just abort request
			if not cred_hash:
				abort(401)
			else:
				# set creds to global object
				g.cred_hash = cred_hash


	@app.after_request
	def check_status(response):
		'''
		'''

		# if preflight then just accept
		if request.method == 'OPTIONS' or 'socket_tickets' in request.url:
			return Response(status=200)

		# if 
		if response.status_code == 401:
			return Response(json.dumps({'status': False, 'data': 'Invalid username and/or password'}), status=401, mimetype='application/json')
		
		status=200
		# if we have response data then overwrite data
		if len(response.response):
			data = json.dumps(response.response)

			# check manual status
			if not response.response['status']:
				status=404
			# return status and data
			return Response(data, status=status, mimetype='application/json')


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
			return Response(response, mimetype='application/json')

		# if we have qa steps then make Jira changes too
		if 'qa_steps' in data and data['qa_steps']:

			# get crucible id and jira key
			data['crucible_id'] = response['data']['crucible_id']
			data['key'] = response['data']['key']

			# update jira
			jira_response = JiraRequests.transition_to_cr(data=data, jira_obj=jira_obj)

			# if update okay then save cru id on return
			if not jira_response['status']:
				cru_id = data['crucible_id']
				response['data'] = response['data'] + f' but Crucible created with ID: {cru_id}'
				response = jira_response

		return Response(response, mimetype='application/json')


	@app.route(f'/{app_name}/jira/worklog', methods=['POST'])
	@cross_origin()
	def worklog():
		'''Updates a Jira ticket with a comment and optional time log

		Args:


		Returns:
			
		'''
		data=request.get_json()
		data["cred_hash"] = g.cred_hash
		response = JiraRequests.worklog(data=data, jira_obj=jira_obj)
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


	@app.route(f'/{app_name}/jira/status', methods=['POST'])
	@cross_origin()
	def change_status():
		post_data = request.get_json()
		data = {
			"cred_hash": g.cred_hash,
			"key": post_data.get('key', ''),
			"status": post_data.get('status', '')
		}

		data = JiraRequests.set_status(data=data, jira_obj=jira_obj)
		return Response(data, mimetype='application/json')


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

	@app.route(f'/{app_name}/jira/profile')
	@cross_origin()
	def get_profile():
		data = JiraRequests.get_profile(data={"cred_hash": g.cred_hash}, jira_obj=jira_obj)
		return Response(data, mimetype='application/json')