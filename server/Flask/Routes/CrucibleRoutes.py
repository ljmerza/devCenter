#!/usr/bin/python3

from flask import request, Response
from flask_cors import cross_origin

from ..Requests.JiraRequests import set_status, add_qa_comment, add_comment, add_commit_comment, edit_comment, delete_comment, add_work_log, get_jira_tickets, find_key_by_msrp, get_profile, parse_comment, modify_watchers

from ..Requests.CrucibleRequests import add_reviewer as CrucibleRequests_add_reviewer, crucible_create_review, get_comments as CrucibleRequests_get_comments

from ..Requests.CodeCloudRequests import create_pull_requests


def define_routes(app, app_name, jira_obj, crucible_obj, g, code_cloud_obj):
	@app.route(f'/{app_name}/crucible/create', methods=['POST'])
	@cross_origin()
	def create_review():
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

			if data['autoPCR']:
				pull_response = create_pull_requests(
					data=data, code_cloud_obj=code_cloud_obj)

			cru_response = crucible_create_review(data=data, crucible_obj=crucible_obj, jira_obj=jira_obj, pull_response=pull_response)
			if not cru_response['status']:
				return Response(cru_response, mimetype='application/json')

			if data['qa_steps']:
				data['crucible_id'] = cru_response['data']
				data['description'] = cru_response['description']
				comment_response = add_qa_comment(data=data, jira_obj=jira_obj)

		elif data['qa_steps']:
			data['comment'] = data['qa_steps']
			comment_response = add_comment(data=data, jira_obj=jira_obj)

		if data['autoPCR']:
			data['status_type'] = 'pcrNeeded'
			pcr_response = set_status(data=data, jira_obj=jira_obj)
			data['status_type'] = 'cr'
			cr_response = set_status(data=data, jira_obj=jira_obj)

		if data['log_time']:
			log_response = add_work_log(data=data, jira_obj=jira_obj)

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
		post_data = request.get_json()
		data = {
			"cred_hash": g.cred_hash,
			"crucible_id": post_data.get('crucible_id', ''),
			"username": post_data.get('username', '')
		}
		
		cru_response = CrucibleRequests_add_reviewer(
			data=data, crucible_obj=crucible_obj)
		return Response(cru_response, mimetype='application/json')

	@app.route(f'/{app_name}/crucible/comments/<crucible_id>')
	@cross_origin()
	def get_comments(crucible_id):
		data = {
			"cred_hash": g.cred_hash,
			"crucible_id": crucible_id,
		}
		cru_response = CrucibleRequests_get_comments(data=data, crucible_obj=crucible_obj)
		return Response(cru_response, mimetype='application/json')
