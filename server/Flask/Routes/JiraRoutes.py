#!/usr/bin/python3

from flask import request, Response
from flask_cors import cross_origin

import Requests.JiraRequests as JiraRequests
import Requests.CrucibleRequests as CrucibleRequests

def define_routes(app, app_name, jira_obj, crucible_obj, g):
	'''
	'''

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

	@app.route(f'/{app_name}/jira/worklog', methods=['POST'])
	@cross_origin()
	def worklog():
		'''Updates a Jira ticket with a comment and optional time log

		Args:


		Returns:
			
		'''
		data=request.get_json()
		data["cred_hash"] = g.cred_hash

		# add comment
		response = JiraRequests.add_comment(data=data, jira_obj=jira_obj)
		# if wants work log then add it
		if data['log_time']:
			response = JiraRequests.add_worklog(data=data, jira_obj=jira_obj)
		# return response
		return Response(response, mimetype='application/json')

	@app.route(f'/{app_name}/jira/status', methods=['POST'])
	@cross_origin()
	def change_status():
		'''
		'''
		post_data = request.get_json()
		data = {
			"cred_hash": g.cred_hash,
			"key": post_data.get('key', ''),
			"status_type": post_data.get('statusType', ''),
			"crucible_id": post_data.get('crucible_id', ''),
			"username": post_data.get('username', '')
		}

		status_response = {'status': False, 'data': 'status type not given'}

		# change status
		if data['status_type'] != 'pcrPass':
			status_response = JiraRequests.set_status(data=data, jira_obj=jira_obj)

		# if pcr pass and status change ok -> process Crucible review
		if data['status_type'] == 'pcrPass' or data['status'] == 'pcrCompleted':
			status_response = CrucibleRequests.complete_review(data=data, crucible_obj=crucible_obj)

		# if QA pass then add merge component
		if data['status_type'] == 'qaPass':
			data['status_type'] = 'mergeCode'
			status_response = JiraRequests.set_status(data=data, jira_obj=jira_obj)


		# return response
		return Response(status_response, mimetype='application/json')



	@app.route(f'/{app_name}/jira/profile')
	@cross_origin()
	def get_profile():
		'''
		'''
		data = JiraRequests.get_profile(data={"cred_hash": g.cred_hash}, jira_obj=jira_obj)
		return Response(data, mimetype='application/json')