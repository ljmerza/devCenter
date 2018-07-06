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
	def create_review():
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
			"msrp": post_data.get('msrp', ''),
			"summary": post_data.get('summary', '')
		}

		response = {'status': True, 'data':{}}
		comment_response = {'status': False}
		log_response = {'status': False}
		cr_response = {'status': False}
		pcr_response = {'status': False}
		cru_response = {'status': False}
		pull_response = {'status': False}

		# if repos given then create crucible
		if len(data['repos']):

			# create crucible review
			cru_response = CrucibleRequests.crucible_create_review(data=data, crucible_obj=crucible_obj, jira_obj=jira_obj)
			# crucible id required to move forward
			if not cru_response['status']:
				return Response(cru_response, mimetype='application/json')

			# add comment to Jira if QA steps exist
			if data['qa_steps']:
				data['crucible_id'] = cru_response['data']
				comment_response = JiraRequests.add_qa_comment(data=data, jira_obj=jira_obj)

		elif data['qa_steps']:
			# else if 'qa steps' aka a comment given then add comment
			data['comment'] = data['qa_steps']
			comment_response = JiraRequests.add_comment(data=data, jira_obj=jira_obj)

		# if transitioning it pcr then add statrus/compoentn and add pull request
		if data['autoPCR']:
			data['status_type'] = 'pcrNeeded'
			pcr_response = JiraRequests.set_status(data=data, jira_obj=jira_obj)
			data['status_type'] = 'cr'
			cr_response = JiraRequests.set_status(data=data, jira_obj=jira_obj)
			# create pull requests
			pull_response = CrucibleRequests.create_pull_requests(data, crucible_obj)

		# add worklog if wanted
		if data['log_time']:
			log_response = JiraRequests.add_work_log(data=data, jira_obj=jira_obj)

		# return responses from each call
		response['data']['comment_response'] = comment_response
		response['data']['log_response'] = log_response
		response['data']['cr_response'] = cr_response
		response['data']['pcr_response'] = pcr_response
		response['data']['cru_response'] = cru_response
		response['data']['pull_response'] = pull_response
		return Response(response, mimetype='application/json')


	@app.route(f'/{app_name}/crucible/add_reviewer', methods=['POST'])
	@cross_origin()
	def add_reviewer():
		'''
		'''
		post_data = request.get_json()
		data = {
			"cred_hash": g.cred_hash,
			"crucible_id": post_data.get('crucible_id', ''),
			"username": post_data.get('username', '')
		}
		
		# add reviewer and return response
		cru_response = CrucibleRequests.add_reviewer(data=data, crucible_obj=crucible_obj)
		return Response(cru_response, mimetype='application/json')

	@app.route(f'/{app_name}/crucible/comments/<crucible_id>')
	@cross_origin()
	def get_comments(crucible_id):
		'''
		'''
		data = {
			"cred_hash": g.cred_hash,
			"crucible_id": crucible_id,
		}
		cru_response = CrucibleRequests.get_comments(data=data, crucible_obj=crucible_obj)
		return Response(cru_response, mimetype='application/json')
