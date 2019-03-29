"""Overall Chat class."""

from .api import ChatAPI
from .misc import ChatMisc
from .pcr_qa import ChatPcrQa


class Chat(ChatMisc, ChatPcrQa, ChatAPI):
	"""Overall Chat class."""

	def __init__(self, debug:bool, no_pings:bool, is_qa_pcr:bool=False, merge_alerts:bool=False):
		"""Setup chat config."""
		self.chat_api = ChatAPI(debug=debug, no_pings=no_pings)

		ChatMisc.__init__(self, chat_api=self.chat_api, merge_alerts=merge_alerts)
		ChatPcrQa.__init__(self, chat_api=self.chat_api, is_qa_pcr=is_qa_pcr)

	def send_dev_center_ticket_info(self, key:str, summary:str, username:str, ping_message:str):
		"""Send a message to the devcenter chatroom."""
		message = f"{ping_message} <a href='{self.chat_api.jira_ticket_base}/{key}'>{key}</a> {summary} {username}"
		self.chat_api.send_meeting_message(message=message, chatroom=self.chat_api.dev_center_chat)
