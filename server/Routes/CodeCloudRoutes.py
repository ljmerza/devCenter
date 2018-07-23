#!/usr/bin/python3

from flask import Response, request
from flask_cors import cross_origin

from ..Requests.CodeCloudRequests import get_repos, create_pull_requests, get_branches, ticket_branches as CCRequests_ticket_branches, create_review as ccCreate_review, add_reviewer_to_pull_request

from ..Requests.JiraRequests import add_comment, add_commit_comment, edit_comment, delete_comment, add_work_log, get_jira_tickets, find_key_by_msrp, get_profile, parse_comment, modify_watchers

def define_routes(app, app_name, g):

	@app.route(f'/{app_name}/git/repos')
	@cross_origin()
	def repos():
		data = get_repos(data={"cred_hash": g.cred_hash})
		return Response(data, mimetype='application/json')

	@app.route(f'/{app_name}/git/repo/<repo_name>')
	@cross_origin()
	def branches(repo_name):
		data = get_branches(data={"repo_name": repo_name, "cred_hash": g.cred_hash})
		return Response(data, mimetype='application/json')

	@app.route(f'/{app_name}/git/branches/<msrp>')
	@cross_origin()
	def ticket_branches(msrp):
		data = CCRequests_ticket_branches(data={"msrp": msrp,"cred_hash": g.cred_hash})
		return Response(data, mimetype='application/json')

	@app.route(f'/{app_name}/codecloud/create', methods=['POST'])
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
			"story_point": post_data.get('story_point', ''),
			"summary": post_data.get('summary', '')
		}

		response = ccCreate_review(data=data)
		return Response(response, mimetype='application/json')

	@app.route(f'/{app_name}/codecloud/add_reviewer', methods=['POST'])
	@cross_origin()
	def add_reviewer():
		post_data = request.get_json()
		data = {
			"cred_hash": g.cred_hash,
			"pull_request_id": post_data.get('pull_request_id', ''),
			"username": post_data.get('username', ''),
			"repo_name": post_data.get('repo_name', '')
		}

		response = add_reviewer_to_pull_request(data)
		return Response(response, mimetype='application/json')

	@app.route(f'/{app_name}/codecloud/add_comment', methods=['POST'])
	@cross_origin()
	def add_comment():
		post_data = request.get_json()
		data = {
			"cred_hash": g.cred_hash,
			"pull_request_id": post_data.get('pull_request_id', ''),
			"username": post_data.get('username', ''),
		}

		response = {'status': False}
		return Response(response, mimetype='application/json')