"""Starts the Dev Center Server."""
import os

from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

from .DevCenterRoutes import define_routes


def start_server():
	"""Starts the Dev Center Server."""
	app = Flask(__name__)
	cors = CORS(app)
	socketio = SocketIO(app)

	app.config['CORS_HEADERS'] = 'Content-Type'
	
	DEV_SERVER = int(os.environ['DEV_SERVER'])
	HOST = os.environ['HOST']
	PORT = int(os.environ['PORT'])

	# set debug if we want it
	if DEV_SERVER:
		# app.config['DEBUG'] = True
		app.config['TEMPLATES_AUTO_RELOAD'] = True

	define_routes(app=app, socketio=socketio)
	socketio.run(app, host=HOST, port=PORT)