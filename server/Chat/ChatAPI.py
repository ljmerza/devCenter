#!/usr/bin/python3

import requests
from requests.auth import HTTPBasicAuth
import os

class ChatAPI():	
	def __init__(self, debug, no_pings):
		
		self.jira_url = os.environ['JIRA_URL']
		self.jira_ticket_base = f'{self.jira_url}/browse'
		##########################################################
		self.username = os.environ['USER']
		self.debug = debug
		self.no_pings = no_pings
		##########################################################
		self.bot_name = os.environ['BOT_NAME']
		self.dev_center_chat = os.environ['CHAT_DEV_CENTER']
		self.bot_password = os.environ['BOT_PASSWORD']
		##########################################################
		self.apex_chat = os.environ['CHAT_APEX']
		self.dti_chat = os.environ['CHAT_DTI']
		##########################################################
		self.chat_url = os.environ['CHAT_URL']
		self.chat_api = f'{self.chat_url}/push'
		self.chat_api_chatroom = f'{self.chat_api}/meeting:'
		self.chat_api_menu = f'{self.chat_api}/menu/'
		##########################################################
		self.project_managers = os.environ['PM'].split(',')
		##########################################################	


	def send_message(self, message, username):
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
		return {'status': response.status_code == 200, 'data': response.text}