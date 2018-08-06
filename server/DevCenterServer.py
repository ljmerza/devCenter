#!/usr/bin/python3

from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

from .DevCenterRoutes import define_routes


def start_server(devflk, host, port, app_name, devdb, sql_echo, dev_chat, no_pings):
	app = Flask(__name__)
	cors = CORS(app)
	socketio = SocketIO(app)

	# set CORS headers
	app.config['CORS_HEADERS'] = 'Content-Type'

	# set debug if we want it
	if devflk:
		# app.config['DEBUG'] = True
		app.config['TEMPLATES_AUTO_RELOAD'] = True

	# define all routes
	define_routes(
		app=app, devflk=devflk,
		app_name=app_name, socketio=socketio, 
		devdb=devdb, sql_echo=sql_echo,
		dev_chat=dev_chat, no_pings=no_pings
	)

	# start server
	socketio.run(app, host=host, port=port)
