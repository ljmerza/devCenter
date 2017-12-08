#!/usr/bin/python3

import requests
from requests.auth import HTTPBasicAuth
import os

class ChatAPI():	
	def __init__(self, debug):
		'''
		'''
		self.crucible_url = os.environ['CRUCIBLE_URL']
		self.crucible_ticket_base = f'{self.crucible_url}/cru'
		self.jira_url = os.environ['JIRA_URL']
		self.jira_ticket_base = f'{self.jira_url}/browse'
		##########################################################
		self.username = os.environ['USER']
		self.debug = debug
		##########################################################
		self.bot_name = os.environ['BOT_NAME']
		self.bot_password = os.environ['BOT_PASSWORD']
		##########################################################
		self.apex_chat = os.environ['CHAT_APEX']
		self.dti_chat = os.environ['CHAT_DTI']
		self.jira_chat = os.environ['CHAT_JIRA']
		##########################################################
		self.chat_url = os.environ['CHAT_URL']
		self.chat_api = f'{self.chat_url}/push'
		self.chat_api_chatroom = f'{self.chat_api}/meeting:'
		self.chat_api_menu = f'{self.chat_api}/menu/'
		##########################################################
		self.project_managers = os.environ['PM'].split(',')
		##########################################################	


	def send_message(self, message, username):
		'''make a POST request to the chat to send a message
		Args:
			message (str) - the message to send to the user
			username (str) the username to send the ping to
		Returns:
			response from POST request
		'''
		# if in debug mode then send all messages to me
		if self.debug:
			username = self.username
			message = '--DEBUG--'+message
		# make POST request
		response = requests.post(f"{self.chat_api}/{username}", data=message, auth=HTTPBasicAuth(self.bot_name, self.bot_password))
		return self._process_response(response=response)

	def send_meeting_message(self, message, chatroom):
		'''make a post request to the chat to send a message to a chat room

		Args:
			message (str) - the message to send to the chatroom
			chatroom (str) the chatroom ID to send the ping to

		Returns:
			None
		'''
		# if in debug mode then send all message to test chatroom
		if self.debug:
			message = '--DEBUG--'+message
		# make POST request
		response = requests.post(f"{self.chat_api_chatroom}{chatroom}", data=message, auth=HTTPBasicAuth(self.bot_name, self.bot_password))
		return self._process_response(response=response)

	def set_z_menu(self, username):
		'''
		Args:
			username - the username of the user to add the menu to

		Returns:
			None
		'''
		response = requests.post(f"{self.chat_api_menu}{username}", data='', auth=HTTPBasicAuth(self.bot_name, self.bot_password))
		return self._process_response(response=response)

	def _process_response(self, response):
		'''
		'''
		if response.status_code == 200:
			return {'status': True, 'data': response.text}
		else:
			return {'status': False, 'data': response.text}


