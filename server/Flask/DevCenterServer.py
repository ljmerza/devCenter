#!/usr/bin/python3

from flask import Flask, render_template, jsonify, send_from_directory, request, Response, stream_with_context
from flask_cors import CORS, cross_origin

import os
import json
import requests
import sys
import base64

from . import JiraRequests
from . import CrucibleRequests

sys.path.append('../Jira')
sys.path.append('../Common')
sys.path.append('../Crucible')

from Crucible import Crucible
from Jira import Jira


def start_server(debug):

    root_dir = os.path.dirname(os.getcwd())
    app_name = 'dev_center'
    port = 5858


    attuid = os.environ['USER']
    password = os.environ['PASSWORD']
    header_value = f'{attuid}:{password}'
    encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
    my_cred_hash = f'Basic {encoded_header}'

    crucible = Crucible()
    jira = Jira()

    app = Flask(__name__)
    cors = CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type'

    if debug:
        app.config['DEBUG'] = True
        app.config['TEMPLATES_AUTO_RELOAD'] = True


    def get_cred_hash(request):
        if 'Authorization' in request.headers:
            return request.headers['Authorization']
        else:
            return my_cred_hash


    @app.route(f"/{app_name}/jira/filter/<filter_number>")
    @cross_origin()
    def jiraFilterTickets(filter_number):
        '''gets a list of formatted Jira tickets given a filter number (adds the Crucible IDs if it can)

        Args:
            filter_number (str) the filter number to get tickets from

        Returns:
            the server response JSON object with status/data properties
        '''
        data = JiraRequests.get_jira_tickets_from_filter(data={
            "filter_number": filter_number,
            "cred_hash": get_cred_hash(request)
        })
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
            "cred_hash": get_cred_hash(request)
        })
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
            "cred_hash":get_cred_hash(request)
        })
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
            "cred_hash": get_cred_hash(request)
        })
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
            "cred_hash": get_cred_hash(request)
        })
        return jsonify(data)


    @app.route("/crucible/review/create/", methods=['POST'])
    @cross_origin()
    def crucible_create_review():
        '''creates a Crucible review with the proper header and branches passed in the body of the request

        Args:
            

        Returns:
            the Crucible ID number if successful else error
        '''
        data = CrucibleRequests.crucible_create_review( data=request.get_json() )
        return jsonify(data)


    @app.route('/crucible/review/pcr_pass/', methods=['POST'])
    @cross_origin()
    def crucible_pcr_pass():
        '''Joins user to a review, completes review, and adds a PCR Pass comment

        Args:
            crucible_id (str) the Crucible ID to PCR pass
            username (str) the user to add to the review

        Returns:
            status ok or fail reason
        '''
        data = {
            "crucible_id": request.form['crucible_id'],
            "username": request.form['username'],
            "cred_hash": get_cred_hash(request)
        }
        data = CrucibleRequests.crucible_pcr_pass(data=data)
        return jsonify(data)


    @app.route('/crucible/review/pcr_complete/', methods=['POST'])
    @cross_origin()
    def crucible_pcr_complete():
        '''Joins user to a review, completes review, adds a PCR Pass comment, 
            and sets the Jira status as PCR - Complete

        Args:
            crucible_id (str) the Crucible ID to PCR pass
            username (str) the user to add to the review

        Returns:
            status ok or fail reason
        '''
        data = CrucibleRequests.set_pcr_complete(data={
            "crucible_id": request.form['crucible_id'],
            "username": request.form['username'],
            "cred_hash": get_cred_hash(request)
        })
        return jsonify(data)



    # start server
    app.run(host='localhost', port=port)