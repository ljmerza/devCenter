#!/usr/bin/python3

class ChatPcrQa():
	'''
	'''

	def __init__(self, chat_api, is_qa_pcr):
		'''
		'''
		self.chat_api = chat_api
		self.is_qa_pcr = is_qa_pcr

	def send_pcr_needed(self, pcr_estimate, key, msrp, sprint, label, crucible_id=''):
		'''send pcr needed to chat room
		Args:
			pcr_estimate (str) the PCR estimate number
			key (str) the Jira key
			msrp (str) the Jira MSRP
			sprint (str) the sprint name
			label (str) string of label for Jira issue
			crucible_id (str) optional Crucible ID (default '')
		Returns:
			None
		'''
		# create message string
		message = f'PCR-{pcr_estimate}'
		# if BETA ticket then add beta string
		if 'BETA' in label:
			message += ' BETA'
		# send message
		self.get_qa_pcr_links(message=message, sprint=sprint, key=key, msrp=msrp, crucible_id=crucible_id)

	def send_qa_needed(self, key, sprint, msrp, label, crucible_id):
		'''send qa needed to chat room
		Args:
			key (str) the Jira key
			msrp (str) the Jira MSRP
			sprint (str) the sprint name
			label (str) string of label for Jira issue
			crucible_id (str) optional Crucible ID (default '')
		Returns:
			None
		'''
		# create message string
		message = ''
		# if BETA ticket then add beta string
		if label is not None and 'BETA' in label:
			message += 'BETA '
		# add messge type
		message += 'QA Needed'
		# send message
		self.get_qa_pcr_links(message=message, sprint=sprint, key=key, msrp=msrp, crucible_id=crucible_id)

	def get_qa_pcr_links(self, message, sprint, key, msrp, crucible_id):
		'''get jira/crucible links along with sprint and send message to chatroom
		Args:
			key (str) the Jira key
			msrp (str) the Jira MSRP
			sprint (str) the sprint name
			message (str) the message type to send
			crucible_id (str) optional Crucible ID (default '')
		Returns:
			None
		'''
		# if fasttrack or SASHA ticket then dont ping
		if ('FastTrack' in sprint) or ('SASHA' in key):
			return
		# add key and MSRP to ticket
		message += f" [{key}] Ticket #{msrp}:"
		# if we have crucible link -> add crucible
		if crucible_id:
			message += f" <a href='{self.chat_api.crucible_ticket_base}/{crucible_id}'>Crucible</a>"
		# add jira link
		message += f" <a href='{self.chat_api.jira_ticket_base}/{key}'>Jira</a>"
		# add sprint if exists
		if sprint:
			message += f" Sprint: {sprint}"

		# send to jira  chat unless is_pcr_qa flag set -> then apex chat
		chatroom = self.chat_api.jira_chat
		if self.is_qa_pcr:
			chatroom = self.chat_api.apex_chat
		# send message
		self.chat_api.send_meeting_message(message=message, chatroom=chatroom)