#!/usr/bin/python3

from flask import request, Response
from flask_cors import cross_origin

import Requests.JiraRequests as JiraRequests
import Requests.CrucibleRequests as CrucibleRequests

def define_routes(app, app_name, jira_obj, crucible_obj, g):
	'''
	'''

	@app.route(f'/{app_name}/crucible/create', methods=['POST'])
	@cross_origin()
	def crucible_create_review():
		'''creates a Crucible review with the proper header and branches passed in the body of the request

		Args:
			

		Returns:
			the Crucible ID number if successful else error
		'''
		post_data = request.get_json()
		data = {
			"cred_hash": g.cred_hash,
			"key": post_data.get('key', ''),
			"repos": post_data.get('repos', ''),
			"password": post_data.get('password', ''),
			"username": post_data.get('username', ''),
			"qa_steps": post_data.get('qa_steps', ''),
			"autoCR": post_data.get('autoCR', False),
			"autoPCR": post_data.get('autoPCR', False),
			"log_time": post_data.get('log_time', 0),
			"msrp": post_data.get('msrp', '')
		}

		# create crucible review
		cru_response = CrucibleRequests.crucible_create_review(data=data, crucible_obj=crucible_obj, jira_obj=jira_obj)
		if not cru_response['status']:
			return Response(cru_response, mimetype='application/json')

		# save cru id on data
		data['crucible_id'] = cru_response['data']


		# add comment to Jira if QA step exist
		if data['qa_steps']:

			# try to add comment now
			data['crucible_id'] = cru_response['data']
			com_response = JiraRequests.add_qa_comment(data=data, jira_obj=jira_obj)
			if not com_response['status']:
				com_response['data'] += ' but Crucible created: ' + cru_response['data']
				return Response(com_response, mimetype='application/json')

			# add PCR needed component if wanted
			if data['autoPCR']:
				data['status_type'] = 'pcrNeeded'
				pcr_response = JiraRequests.set_status(data=data, jira_obj=jira_obj)
				if not pcr_response['status']:
					pcr_response['data'] += ' but Crucible created: ' + cru_response['data']
					return Response(pcr_response, mimetype='application/json')

			# add CR status if wanted
			if data['autoCR']:
				data['status_type'] = 'cr'
				cr_response = JiraRequests.set_status(data=data, jira_obj=jira_obj)
				if not cr_response['status']:
					cr_response['data'] += ' but Crucible created: ' + cru_response['data']
					return Response(cr_response, mimetype='application/json')

			# add worklog if wanted
			if data['log_time']:
				log_response = JiraRequests.add_worklog(data=data, jira_obj=jira_obj)
				if not log_response['status']:
					log_response['data'] += ' but Jira log and Crucible created: ' + cru_response['data']
					return Response(log_response, mimetype='application/json')

		# return Crucible response with cru id
		return Response(cru_response, mimetype='application/json')