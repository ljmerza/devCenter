#!/usr/bin/python3

from flask import Flask, render_template, jsonify, send_from_directory, request, Response, stream_with_context
from flask_cors import CORS, cross_origin

import os
import json
import requests

import sys
sys.path.append('..')

from Crucible import Crucible
from Jira import Jira
from . import CrucibleRequests


def start_server(debug):

    attuid = os.environ['USER']
    password = os.environ['PASSWORD']

    root_dir = os.path.dirname(os.getcwd())
    folder_name = 'iTrack2'
    app_name = 'leo'

    crucible = Crucible.Crucible()
    jira = Jira.Jira()

    app = Flask(__name__)
    cors = CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type'

    if debug:
        app.config['DEBUG'] = True
        app.config['TEMPLATES_AUTO_RELOAD'] = True



    @app.route(f'/{app_name}/node_modules/<path:path>')
    def node_modules(path):
        return send_from_directory(os.path.join(root_dir, f'{folder_name}/node_modules'), path)

    @app.route(f'/{app_name}/static/<path:path>')
    def static_files(path):
        return send_from_directory(os.path.join(root_dir, f'{folder_name}/static'), path)


    @app.route("/jira/filter/<filter_key>")
    @cross_origin()
    def jiraFilter(filter_key):
        jira.login()
        crucible.login()
        jira_data = jira.get_jira_tickets(filter_number=filter_key)
        jira_data = crucible.get_review_links(data=jira_data)
        return jsonify(jira_data)

    @app.route("/crucible/filter/<keys>")
    @cross_origin()
    def crucibleLinks(keys):
        # convert from query string to array here -----------------------
        crucible.login()
        return_data = crucible.get_all_review_links(keys=keys)
        return jsonify(return_data)



    @app.route("/jira/openTickets/<start_at>/<max_results>")
    @cross_origin()
    def openTickets(start_at, max_results): 
        jira.login()
        jira_data = jira.get_raw_jira_data(filter_number=11002, max_results=max_results, start_at=start_at)
        return jsonify(jira_data)

    @app.route(f'/{app_name}/jira/get_key/<msrp>')
    @cross_origin()
    def getKey(msrp): 
        jira.login()
        jira_data = jira.find_key_by_msrp(msrp=msrp)
        return jsonify({'key': jira_data})

    @app.route("/git/repos")
    @cross_origin()
    def repos():
        repo_names, repo_locations = crucible.get_repos()
        return jsonify(repo_names)

    @app.route("/git/repo/<repo_name>")
    @cross_origin()
    def branches(repo_name):
        data = cru.get_branches(repo_name)
        return jsonify(data)

    @app.route("/git/repo/<repo_name>/<msrp>")
    @cross_origin()
    def branch(repo_name, msrp):
        data = crucible.find_branch(repo_name, msrp)
        return jsonify({ "branch_name": data})


    @app.route(f"/{app_name}/<template_name>")
    @cross_origin()
    def qa_step_gen(template_name):
        repo_names = ['AQE','aqe_api', 'Modules','Selenium_tests','Taskmaster','TeamDB','teamdbapi','teamdb_ember','Templates','Tools','TQI','UD','UD_api','UD_ember','UPM','upm_api','WAM','wam_api']
        return render_template(template_name+'.html', repo_names=repo_names)

    @app.route("/crucible/review/create/", methods=['POST'])
    @cross_origin()
    def crucible_create_review():
        '''create a crucible review, add QA steps on Jira and log time on Jira

        Returns:
            dict: status boolean and data hash
        '''
        data = CrucibleRequests.crucible_create_review( data=request.get_json() )
        return jsonify(data)


    @app.route('/crucible/review/pcr_pass/', methods=['POST'])
    @cross_origin()
    def crucible_pcr_pass():
        data = {
            "crucible_id": request.form['crucible_id'],
            "attuid": request.form['attuid'],
            "cred_hash": request.headers['Authorization']
        }
        print(data)
        data = CrucibleRequests.crucible_pcr_pass(data=data)
        return jsonify(data)

    @app.route('/crucible/review/pcr_complete/', methods=['POST'])
    @cross_origin()
    def crucible_pcr_complete():
        data = {
            "crucible_id": request.form['crucible_id'],
            "attuid": request.form['attuid'],
            "cred_hash": request.headers['Authorization']
        }
        data = CrucibleRequests.set_pcr_complete(data=data)
        return jsonify(data)



    app.run(host='0.0.0.0', port=5858)