#!/usr/bin/python3

from flask import request, Response
from flask_cors import cross_origin

from ..Requests.JiraRequests import get_jira_tickets, find_key_by_msrp, edit_comment, add_work_log, set_status, add_comment, set_status, add_commit_comment, modify_watchers as JiraRequests_modify_watchers, parse_comment as JiraRequests_parse_comment, delete_comment

from ..Requests.CrucibleRequests import add_reviewer, pass_review


def define_routes(app, app_name, jira_obj, crucible_obj, sql_obj, g, code_cloud_obj):
	@app.route(f'/{app_name}/jira/tickets')
	@cross_origin()
	def jiraTickets():
		data = get_jira_tickets(data={
			'filter_number': request.args.get('filter'),
			'jql': request.args.get('jql'),
			'fields': request.args.get('fields'),
			'cred_hash': g.cred_hash
		}, jira_obj=jira_obj)
		return Response(data, mimetype='application/json')

	@app.route(f'/{app_name}/jira/getkey/<msrp>')
	@cross_origin()
	def getKey(msrp):
		data = find_key_by_msrp(data={
			'msrp': msrp,
			'cred_hash': g.cred_hash
		}, jira_obj=jira_obj)
		return Response(data, mimetype='application/json')

	@app.route(f'/{app_name}/jira/comment', methods=['PUT', 'DELETE', 'POST'])
	@cross_origin()
	def jira_comment():
		response = {'status':True, 'data': {}}

		# PUT - edit a comment
		if request.method == 'PUT':
			data=request.get_json()
			data['cred_hash'] = g.cred_hash
			response = edit_comment(data=data, jira_obj=jira_obj)

		# POST - add a comment
		elif request.method == 'POST':
			data=request.get_json()
			data['cred_hash'] = g.cred_hash
			log_response = {}
			conflict_response = {}
			merge_response = {}
			comment_response = {}
			commit_response = {}

			if data.get('log_time', False): 
				log_response = add_work_log(data=data, jira_obj=jira_obj)
				
			if data.get('remove_conflict', False):
				data['status_type'] = 'removeMergeConflict'
				conflict_response = set_status(data=data, jira_obj=jira_obj)

			if data.get('comment', False):
				comment_response = add_comment(data=data, jira_obj=jira_obj)

			response['data']['log_response'] = log_response
			response['data']['conflict_response'] = conflict_response
			response['data']['merge_response'] = merge_response
			response['data']['comment_response'] = comment_response
			response['data']['commit_response'] = commit_response

		# else get comments
		else:
			data = {
				'comment_id': request.args.get('comment_id'),
				'key': request.args.get('key'),
				'cred_hash': g.cred_hash
			}
			response = delete_comment(data=data, jira_obj=jira_obj)

		return Response(response, mimetype='application/json')


	@app.route(f'/{app_name}/jira/status', methods=['POST'])
	@cross_origin()
	def change_status():
		post_data = request.get_json()
		data = {
			'cred_hash': g.cred_hash,
			'key': post_data.get('key', ''),
			'status_type': post_data.get('statusType', ''),
			'crucible_id': post_data.get('crucible_id', ''),
			'username': post_data.get('username', ''),
			'add_commits': post_data.get('add_commits', False),
			'master_branch': post_data.get('master_branch', '')
		}

		status_response = {'status': False, 'data': 'status type not given'}

		# change status on Jira if not pcr pass/add (they are 'fake' statuses)
		if data['status_type'] != 'pcrPass' and data['status_type'] != 'pcrAdd':
			status_response = set_status(data=data, jira_obj=jira_obj)
		
		# if pcrAdd then add user to review
		if data['status_type'] == 'pcrAdd':
			if data['crucible_id']:
				status_response = add_reviewer(data=data, crucible_obj=crucible_obj)
			else:
				status_response['status'] = True

		# if pcr pass/complete -> add user, complete review, add comment to Crucible
		if data['status_type'] == 'pcrPass' or data['status_type'] == 'pcrCompleted':
			status_response = pass_review(data=data, crucible_obj=crucible_obj)

		# if uctReady then add commit hashes to Jira comment if specified
		if data.get('add_commits', False):
			status_response = add_commit_comment(data=data, jira_obj=jira_obj, code_cloud_obj=code_cloud_obj)

		return Response(status_response, mimetype='application/json')

	@app.route(f'/{app_name}/jira/parse_comment', methods=['POST'])
	@cross_origin()
	def parse_comment(key):
		data=request.get_json()
		data['cred_hash'] = g.cred_hash

		data = JiraRequests_parse_comment(data=data, jira_obj=jira_obj)
		return Response(data, mimetype='application/text')

	@app.route(f'/{app_name}/jira/watchers/<key>/<username>', methods=['POST', 'DELETE', 'GET'])
	@cross_origin()
	def modify_watchers(key, username):
		response = {'status': False, 'data': {}}

		# get all watcher
		if request.method == 'GET':
			response = JiraRequests_modify_watchers(data={
				'type_of_modify': 'get',
				'cred_hash': g.cred_hash,
				'key': key
			}, jira_obj=jira_obj)

		# POST - add watcher
		elif request.method == 'POST':
			data = {
				'cred_hash': g.cred_hash,
				'type_of_modify': 'add',
				'key': key,
				'username': username
			}
			response = JiraRequests_modify_watchers(data=data, jira_obj=jira_obj)

		# else remove watcher
		else:
			data = {
				'username': username,
				'key': key,
				'cred_hash': g.cred_hash,
				'type_of_modify': 'remove'
			}
			response = JiraRequests_modify_watchers(data=data, jira_obj=jira_obj)

		return Response(response, mimetype='application/json')
