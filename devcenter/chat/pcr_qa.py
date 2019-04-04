"""Handle Chat communication for QA and PCR notifications."""
import os


class ChatPcrQa():
	"""Handle Chat communication for QA and PCR notifications."""

	def __init__(self, chat_api):
		"""Save the API to send chat pings and if sent to dc chat or team chat."""
		self.chat_api = chat_api
		self.send_pings_to_team = int(os.environ['IS_QA_PCR'])

	def send_pcr_needed(self, pcr_estimate, key, msrp, sprint, label, summary, override=False):
		"""Send a pcr needed ping to the chat server."""
		message = f'PCR-{pcr_estimate} '
		return self.send_action_needed_ping(message=message, sprint=sprint, key=key, msrp=msrp, override=override, label=label, summary=summary)

	def send_qa_needed(self, key, sprint, msrp, label, summary, override=False):
		"""Send a qa needed ping to the chat server."""
		message = 'QA Needed '

		if self.send_pings_to_team or override:
			return self.send_action_needed_ping(message=message, sprint=sprint, key=key, msrp=msrp, override=override, label=label, summary=summary)
		else:
			return {'status': True}

	def send_action_needed_ping(self, message, sprint, key, msrp, override, label, summary=''):
		"""Generate an action ping to send to the chat."""
		# if fast track or SASHA ticket then dont ping
		if ('FastTrack' in sprint) or ('SASHA' in key):
			return

		if label is not None and 'BETA' in label:
			message += 'BETA '

		message += f"[{msrp}] <a href='{self.chat_api.jira_ticket_base}/{key}'>{key}</a>"

		if sprint:
			message += f" {sprint}"

		message += f" {summary}"

		chatroom = self.chat_api.dev_center_chat
		if self.send_pings_to_team or override:
			chatroom = self.chat_api.apex_chat
			
		return self.chat_api.send_meeting_message(message=message, chatroom=chatroom)