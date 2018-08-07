#!/usr/bin/python3

from .ChatAPI import ChatAPI
from .ChatMisc import ChatMisc
from .ChatPcrQa import ChatPcrQa

class Chat(ChatMisc, ChatPcrQa, ChatAPI):

	def __init__(self, debug:bool, no_pings:bool, is_qa_pcr:bool=False, merge_alerts:bool=False):
		self.chat_api = ChatAPI(debug=debug, no_pings=no_pings)

		ChatMisc.__init__(self, chat_api=self.chat_api, merge_alerts=merge_alerts)
		ChatPcrQa.__init__(self, chat_api=self.chat_api, is_qa_pcr=is_qa_pcr)

	def send_me_ticket_info(self, key:str, summary:str, username:str, ping_message:str):
		message = f"{ping_message} <a href='{self.chat_api.jira_ticket_base}/{key}'>{key}</a> {summary} {username}"
		self.chat_api.send_message(message=message, username=self.chat_api.username)
