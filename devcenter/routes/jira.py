"""Creates all jira based routes."""
import os

from flask import request, Response
from flask_cors import cross_origin

from devcenter.requests.jira import (
	get_jira_tickets, find_key_by_msrp, edit_comment, 
	add_work_log, set_status, add_comment, set_status,
	modify_watchers, parse_comment, delete_comment, 
	get_active_sprints
)


def define_routes(app, g):
	"""Define all  Jira Routes."""
	try:
		APP_NAME = os.environ['APP_NAME']
	except KeyError:
		APP_NAME = ''
	
	@app.route(f'/{APP_NAME}/jira/tickets')
	@cross_origin()
	def jiraTickets():
		data = get_jira_tickets(data={
			'filter_number': request.args.get('filter'),
			'jql': request.args.get('jql'),
			'fields': request.args.get('fields'),
			'cred_hash': g.cred_hash
		})
		return Response(data, mimetype='application/json')

	@app.route(f'/{APP_NAME}/jira/getkey/<msrp>')
	@cross_origin()
	def getKey(msrp):
		data = find_key_by_msrp(data={
			'msrp': msrp,
			'cred_hash': g.cred_hash
		})
		return Response(data, mimetype='application/json')

	@app.route(f'/{APP_NAME}/jira/comment', methods=['PUT', 'DELETE', 'POST'])
	@cross_origin()
	def jira_comment():
		response = {'status':True, 'data': {}}

		# PUT - edit a comment
		if request.method == 'PUT':
			data=request.get_json()
			data['cred_hash'] = g.cred_hash
			response = edit_comment(data=data)

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
				log_response = add_work_log(data=data)
				
			if data.get('remove_conflict', False):
				data['status'] = 'Remove Merge Conflict'
				conflict_response = set_status(data=data)

			if data.get('comment', False):
				comment_response = add_comment(data=data)

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
			response = delete_comment(data=data)

		return Response(response, mimetype='application/json')


	@app.route(f'/{APP_NAME}/jira/status', methods=['POST'])
	@cross_origin()
	def change_status():
		post_data = request.get_json()
		data = {
			'cred_hash': g.cred_hash,
			'key': post_data.get('key', ''),
			'status': post_data.get('status', {}),
			'original_status': post_data.get('originalStatus', {}),
			'is_adding_component': post_data.get('isAddingComponent', ''),
			'is_removing_component': post_data.get('isRemovingComponent', ''),
			'username': post_data.get('username', ''),
			'add_commits': post_data.get('addCommits', False),
			'master_branch': post_data.get('masterBranch', ''),
			'pull_requests': post_data.get('pullRequests', []),
			'repo_name': post_data.get('repoName', ''),
			'dev_changes': post_data.get('devChanges', '')
		}

		status_response = set_status(data=data)
		return Response(status_response, mimetype='application/json')

	@app.route(f'/{APP_NAME}/jira/parse_comment', methods=['POST'])
	@cross_origin()
	def parse_comment_route(key):
		data=request.get_json()
		data['cred_hash'] = g.cred_hash
		data = parse_comment(data=data)
		return Response(data, mimetype='application/text')

	@app.route(f'/{APP_NAME}/jira/watchers/<key>/<username>', methods=['POST', 'DELETE', 'GET'])
	@cross_origin()
	def modify_watchers_route(key, username):
		response = {'status': False, 'data': {}}

		# get all watcher
		if request.method == 'GET':
			response = modify_watchers(data={
				'type_of_modify': 'get',
				'cred_hash': g.cred_hash,
				'key': key
			})

		# POST - add watcher
		elif request.method == 'POST':
			data = {
				'cred_hash': g.cred_hash,
				'type_of_modify': 'add',
				'key': key,
				'username': username
			}
			response = modify_watchers(data=data)

		# else remove watcher
		else:
			data = {
				'username': username,
				'key': key,
				'cred_hash': g.cred_hash,
				'type_of_modify': 'remove'
			}
			response = modify_watchers(data=data)

		return Response(response, mimetype='application/json')

	@app.route(f'/{APP_NAME}/jira/active_sprints', methods=['GET'])
	@cross_origin()
	def active_sprints_route():
		response = get_active_sprints(data={'cred_hash': g.cred_hash})
		return Response(response, mimetype='application/text')
