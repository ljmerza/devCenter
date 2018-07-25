#!/usr/bin/python3

class ChatPcrQa():
	def __init__(self, chat_api, is_qa_pcr):
		self.chat_api = chat_api
		self.is_qa_pcr = is_qa_pcr

	def send_pcr_needed(self, pcr_estimate, key, msrp, sprint, label, override=False):
		message = f'PCR-{pcr_estimate}'

		if 'BETA' in label:
			message += ' BETA'

		self.get_qa_pcr_links(message=message, sprint=sprint, key=key, msrp=msrp, override=override)

	def send_qa_needed(self, key, sprint, msrp, label, override=False):
		message = ''

		if label is not None and 'BETA' in label:
			message += 'BETA '

		message += 'QA Needed'
		self.get_qa_pcr_links(message=message, sprint=sprint, key=key, msrp=msrp, override=override)

	def get_qa_pcr_links(self, message, sprint, key, msrp, override):
		# if fasttrack or SASHA ticket then dont ping
		if ('FastTrack' in sprint) or ('SASHA' in key):
			return

		message += f" [{key}] Ticket #{msrp}:"
		message += f" <a href='{self.chat_api.jira_ticket_base}/{key}'>Jira</a>"

		if sprint:
			message += f" Sprint: {sprint}"

		chatroom = self.chat_api.jira_chat
		if self.is_qa_pcr or override:
			chatroom = self.chat_api.apex_chat
			
		self.chat_api.send_meeting_message(message=message, chatroom=chatroom)