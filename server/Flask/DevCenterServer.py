#!/usr/bin/python3

from flask import Flask, render_template, jsonify, send_from_directory, request, Response, stream_with_context
from flask_cors import CORS, cross_origin

import os
import json
import requests
import sys
import base64

import JiraRequests
import CrucibleRequests


def start_server(debug, jira_obj, crucible_obj):

	root_dir = os.path.dirname(os.getcwd())
	app_name = 'dev_center'
	port = 5858

	try:
		host = os.environ['FLASK_HOST'] or '0.0.0.0'
	except:
		host = '0.0.0.0'
	


	username = os.environ['USER']
	password = os.environ['PASSWORD']
	header_value = f'{username}:{password}'
	encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
	my_cred_hash = f'Basic {encoded_header}'

	app = Flask(__name__, template_folder=os.path.abspath('../templates'), static_folder=os.path.abspath('../'))
	cors = CORS(app)
	app.config['CORS_HEADERS'] = 'Content-Type'

	if debug:
		app.config['DEBUG'] = True
		app.config['TEMPLATES_AUTO_RELOAD'] = True


	def get_cred_hash(request, required=False):
		cred_hash = my_cred_hash
		if required:
			cred_hash = ''
		return request.headers.get('Authorization', cred_hash)

	
	@app.route(f'/node_modules/<path:path>')
	def node_modules(path):
		return send_from_directory(f'{app.static_folder}/node_modules/', path)

	@app.route(f'/static/<path:path>')
	def static_files(path):
		return send_from_directory(f'{app.static_folder}/static/', path)

	@app.route(f"/{app_name}/qagen")
	@cross_origin()
	def qa_step_gen():
		repo_names = ['AQE','aqe_api', 'Modules','Selenium_tests','Taskmaster','TeamDB','teamdbapi','teamdb_ember','Templates','Tools','TQI','UD','UD_api','UD_ember','UPM','upm_api','WAM','wam_api']
		return render_template('qagen.html', repo_names=repo_names)


	@app.route(f"/leo/qagen")
	@cross_origin()
	def qa_step_gen_old():
		repo_names = ['AQE','aqe_api', 'Modules','Selenium_tests','Taskmaster','TeamDB','teamdbapi','teamdb_ember','Templates','Tools','TQI','UD','UD_api','UD_ember','UPM','upm_api','WAM','wam_api']
		return render_template('qagen.html', repo_names=repo_names)


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
			"cred_hash": get_cred_hash(request=request)
		}, jira_obj=jira_obj)
		return jsonify(data)


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
			"cred_hash": get_cred_hash(request=request)
		}, jira_obj=jira_obj)
		return jsonify(data)


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
			"cred_hash":get_cred_hash(request=request)
		}, crucible_obj=crucible_obj)
		return jsonify(data)


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
			"cred_hash": get_cred_hash(request=request)
		}, crucible_obj=crucible_obj)
		return jsonify(data)



	@app.route(f'/{app_name}/git/repo/<repo_name>/<msrp>')
	@cross_origin()
	def branch(repo_name, msrp):
		'''returns all branches from a repo that have a MSRP number in the branch name

		Args:
			repo_name (str) the name if the repo to get all the branches from
			msrp (str) the MSRP to search for in the branch names

		Returns:
			
		'''
		data = CrucibleRequests.find_branch(data={
			"msrp": msrp,
			"repo_name": repo_name, 
			"cred_hash": get_cred_hash(request=request)
		}, crucible_obj=crucible_obj)
		return jsonify(data)


	@app.route(f'/{app_name}/crucible/review/create', methods=['POST'])
	@cross_origin()
	def crucible_create_review():
		'''creates a Crucible review with the proper header and branches passed in the body of the request

		Args:
			

		Returns:
			the Crucible ID number if successful else error
		'''
		data=request.get_json()
		data["cred_hash"] = get_cred_hash(request)
		data = CrucibleRequests.crucible_create_review(data=data, crucible_obj=crucible_obj, jira_obj=jira_obj)
		return jsonify(data)


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
			"cred_hash": get_cred_hash(request=request, required=True)
		}
		if 'crucible_id' in post_data:
			data["crucible_id"] = post_data['crucible_id']
		if 'username' in post_data:
			data["username"] = post_data['username']
		# make POST call and return result
		data = CrucibleRequests.set_pcr_pass(data=data, crucible_obj=crucible_obj)
		return jsonify(data)


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
			"cred_hash": get_cred_hash(request=request, required=True)
		}
		if 'key' in post_data:
			data["key"] = post_data['key']
		if 'username' in post_data:
			data["username"] = post_data['username']
		# make POST call and return result
		data = JiraRequests.set_pcr_complete(data=data, jira_obj=jira_obj)
		return jsonify(data)



	# start server
	app.run(host=host, port=port)