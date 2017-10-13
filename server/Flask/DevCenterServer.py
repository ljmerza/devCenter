#!/usr/bin/python3

from flask import Flask, render_template, jsonify, send_from_directory, request, Response, stream_with_context
from flask_cors import CORS, cross_origin

import os
import json
import requests

sys.path.append('../Jira')
sys.path.append('../Common')
sys.path.append('../Crucible')

from Crucible import Crucible
from Jira import Jira


def start_server(debug):

    root_dir = os.path.dirname(os.getcwd())
    app_name = 'dev_center'
    port = '5858'
    host = '0.0.0.0'

    crucible = Crucible()
    jira = Jira()

    app = Flask(__name__)
    cors = CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type'

    if debug:
        app.config['DEBUG'] = True
        app.config['TEMPLATES_AUTO_RELOAD'] = True




    @app.route("/jira/filter/<filter_number>")
    @cross_origin()
    def jiraFilterTickets(filter_number):
        '''gets a list of formatted Jira tickets given a filter number (adds the Crucible IDs if it can)

        Args:
            filter_number (str) the filter number to get tickets from

        Returns:
            the server response JSON object with status/data properties
        '''
        data = {
            "filter_number": request.form['filter_number'],
            "cred_hash": request.headers['Authorization']
        }
        data = JiraRequests.set_pcr_complete(data=data)
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
        data = {
            "msrp": request.form['msrp'],
            "cred_hash": request.headers['Authorization']
        }
        data = JiraRequests.find_key_by_msrp(data=data)
        return jsonify(data)


    @app.route("/git/repos")
    @cross_origin()
    def repos():
        '''
        '''
        data = CrucibleRequests.get_repos({"cred_hash": request.headers['Authorization']})
        return jsonify(data)


    @app.route("/git/repo/<repo_name>")
    @cross_origin()
    def branches(repo_name):
        '''
        '''
        data = cru.get_branches(repo_name)
        return jsonify(data)


    @app.route("/git/repo/<repo_name>/<msrp>")
    @cross_origin()
    def branch(repo_name, msrp):
        '''
        '''
        data = crucible.find_branch(repo_name, msrp)
        return jsonify({ "branch_name": data})


    @app.route(f"/{app_name}/<template_name>")
    @cross_origin()
    def qa_step_gen(template_name):
        '''
        '''
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
        '''
        '''
        data = {
            "crucible_id": request.form['crucible_id'],
            "username": request.form['username'],
            "cred_hash": request.headers['Authorization']
        }
        data = CrucibleRequests.crucible_pcr_pass(data=data)
        return jsonify(data)


    @app.route('/crucible/review/pcr_complete/', methods=['POST'])
    @cross_origin()
    def crucible_pcr_complete():
        '''
        '''
        data = {
            "crucible_id": request.form['crucible_id'],
            "username": request.form['username'],
            "cred_hash": request.headers['Authorization']
        }
        data = CrucibleRequests.set_pcr_complete(data=data)
        return jsonify(data)



    # start server
    app.run(host=host, port=host)