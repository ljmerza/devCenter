#!/usr/bin/python3

from ChatAPI import ChatAPI
from ChatMisc import ChatMisc
from ChatPcrQa import ChatPcrQa

class Chat(ChatMisc, ChatPcrQa, ChatAPI):

	def __init__(self, debug, is_qa_pcr=0, merge_alerts=0):

		self.chat_api = ChatAPI(debug=debug)

		ChatMisc.__init__(self, chat_api=self.chat_api, merge_alerts=merge_alerts)
		ChatPcrQa.__init__(self, chat_api=self.chat_api, is_qa_pcr=is_qa_pcr)

	def send_me_ticket_info(self, key, summary, username, ping_message):
		'''send me the new ticket
		Args:
			key (str) the Jira key
			summary (str) the summary of the Jira ticket
			username (str) the username to send the ping to
			ping_message (str) the type of ping to make
		Returns:
			None
		'''
		self.chat_api.send_message(message=f"{ping_message} <a href='{self.chat_api.jira_ticket_base}/{key}'>{key}</a> {summary} {username}", username=self.chat_api.username)