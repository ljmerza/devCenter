"""API for interacting with chat system."""
import os

import requests
from requests.auth import HTTPBasicAuth


class ChatAPI():
	"""API for interacting with chat system."""

	def __init__(self):
		"""Setup chat variables."""
		self.jira_url = os.environ.get('JIRA_URL', '')
		self.jira_ticket_base = f'{self.jira_url}/browse'
		
		self.username = os.environ.get('USER', '')
		self.debug = int(os.environ.get('DEV_BOT', 0))
		self.no_pings = int(os.environ.get('NO_PINGS', 0))
		self.bot_name = os.environ.get('BOT_NAME', '')
		self.dev_center_chat = os.environ.get('CHAT_DEV_CENTER', '')
		self.bot_password = os.environ.get('BOT_PASSWORD', '')
		self.apex_chat = os.environ.get('CHAT_APEX', '')
		self.dti_chat = os.environ.get('CHAT_DTI', '')

		self.chat_url = os.environ.get('CHAT_URL', '')
		self.chat_api = f'{self.chat_url}/push'
		self.chat_api_chatroom = f'{self.chat_api}/meeting:'
		self.chat_api_menu = f'{self.chat_api}/menu/'

		self.project_managers = os.environ.get('PM', '').split(',')

	def send_message(self, message, username):
		"""Send a message to a user."""
		if self.debug:
			username = self.username
			message = f"--DEBUG--{message}"

		if self.no_pings:
			return {'status': True, 'data': 'OKAY'}
		else:
			url = f"{self.chat_api}/{username}"
			auth = HTTPBasicAuth(self.bot_name, self.bot_password)
			response = requests.post(url, data=message.encode('utf-8', "ignore"), auth=auth)
			return self._process_response(response=response)

	def send_meeting_message(self, message, chatroom):
		"""Sent a message to a chat room."""
		if self.debug:
			message = f"--DEBUG--{message}"

		if self.no_pings:
			return {'status': True, 'data': 'OKAY'}
		else:
			url = f"{self.chat_api_chatroom}{chatroom}"
			auth = HTTPBasicAuth(self.bot_name, self.bot_password)
			response = requests.post(url, data=message.encode('utf-8', "ignore"), auth=auth)
			return self._process_response(response=response)

	def _process_response(self, response):
		"""setup the chat response."""
		return {'status': response.status_code == 200, 'data': response.text}