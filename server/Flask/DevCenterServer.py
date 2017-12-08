#!/usr/bin/python3

from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

from DevCenterRoutes import *

def start_server(devflk, host, port, app_name, jira_obj, crucible_obj, sql_obj, chat_obj):
	'''
	'''

	app = Flask(__name__)
	cors = CORS(app)
	socketio = SocketIO(app)

	# set CORS headers
	app.config['CORS_HEADERS'] = 'Content-Type'

	# set debug if we want it
	if devflk:
		app.config['DEBUG'] = True
		app.config['TEMPLATES_AUTO_RELOAD'] = True

	# define all routes
	define_routes(
		app=app, devflk=devflk, socketio=socketio, 
		jira_obj=jira_obj, crucible_obj=crucible_obj, 
		sql_obj=sql_obj, app_name=app_name,
		chat_obj=chat_obj
	)

	# start server
	socketio.run(app, host=host, port=port)
