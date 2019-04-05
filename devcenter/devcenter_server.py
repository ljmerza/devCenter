"""Starts the Dev Center Server."""
import os

from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

from .devcenter_routes import define_routes


def start_server():
	"""Starts the Dev Center Server."""
	app = Flask(__name__)
	cors = CORS(app)
	socketio = SocketIO(app)

	app.config['CORS_HEADERS'] = 'Content-Type'
	
	HOST = os.environ['HOST']
	PORT = int(os.environ['PORT'])

	define_routes(app=app, socketio=socketio)
	socketio.run(app, host=HOST, port=PORT)