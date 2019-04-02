import os

from devcenter.server_utils import (
	get_branch_name, get_estimate_string, 
	build_message, td_alt_style, table_style, td_style
)


class ChatMisc():
	"""Miscellaneous chat actions."""

	def __init__(self, chat_api, merge_alerts):
		"""Set chat config."""
		self.chat_api = chat_api
		self.merge_alerts = merge_alerts

	def send_new_ticket(self, key, msrp, summary, username, story_point, pcr_estimate, epic_link):
		"""Send a new Jira ticket to a user."""
		branch = get_branch_name(username=username, msrp=msrp, summary=summary)
		estimate = get_estimate_string(story_point=story_point)

		data = {
			"summary": summary,
			"msrp": msrp,
			"branch": branch,
			"pcr_estimate": pcr_estimate,
			"estimate": estimate,
			"epic_link": epic_link,
			"key": key,
			"type_message": 'New Ticket'
		}

		message = build_message(
			data=data, msrp_message=True, 
			jira_message=True, branch_message=True, 
			summary_message=True, estimate_message=True, 
			crucible_title_message=True
		)

		if(username not in self.chat_api.project_managers):
			return self.chat_api.send_message(message=message, username=username)
			
	def send_merge_needed(self, key, msrp, summary, username, sprint, epic_link):
		"""Send a merge needed notification to a user."""
		branch = get_branch_name(username=username, msrp=msrp, summary=summary)
		sprint = sprint.replace(" ", "")

		data = {
			"summary": summary,
			"msrp": msrp,
			"key": key,
			"epic_link": epic_link,
			"sprint": sprint,
			"branch": branch,
			"type_message": 'Merge needed'
		}

		message = build_message(
			data=data, commit_message=True, 
			jira_message=True, branch_message=True, 
			sprint_message=True
		)

		if(username not in self.chat_api.project_managers):
			return self.chat_api.send_message(message=message, username=username)

	def send_merge_alert(self, key, msrp, sprint, username, repos_merged, summary):
		"""Send a merge notification to a chat room."""
		message = ''
		last_repo_index = len(repos_merged) -1
		
		# generate list of repos string
		for index, repo in enumerate(repos_merged):
			if index == 0:
				message += f"{repo}"
			elif len(repos_merged) == 2 and index == 1:
				message += f" and {repo}"
			elif index == last_repo_index:
				message += f", and {repo}"
			else:
				message += f", {repo}"

		# format sprint and rest of message
		sprint = sprint.replace(' ', '')
		message += f" for '{summary}'  on sprint {sprint} has been updated by {username} - <a href='{self.chat_api.jira_ticket_base}{key}'>Jira</a>"
		
		chatroom = self.chat_api.username
		if self.merge_alerts:
			chatroom = self.chat_api.apex_chat

		self.chat_api.send_meeting_message(message=message, chatroom=chatroom)

	def beta_statistics(self, uct, pcr, qa, cr, beta):
		"""Send current beta week statistics to a chatroom."""
		message = f"<br> \
			Beta Statistics: <br> \
				<table style='{table_style}'> \
					<tr> \
						<td style='{td_style}'>UAT ready</td> \
						<td style='{td_style}'>{uct}</td> \
					</tr> \
					<tr> \
						<td style='{td_style} {td_alt_style}'>PCR Ready</td> \
						<td style='{td_style} {td_alt_style}'>{pcr}</td> \
					</tr> \
					<tr> \
						<td style='{td_style}'>QA Ready</td> \
						<td style='{td_style}'>{qa}</td> \
					</tr> \
					<tr> \
						<td style='{td_style} {td_alt_style}'>CR Ready</td> \
						<td style='{td_style} {td_alt_style}'>{cr}</td> \
					</tr> \
					<tr> \
						<td style='{td_style}'>Beta Tickets</td> \
						<td style='{td_style}'>{beta}</td> \
					</tr> \
				 </table>"

		self.chat_api.send_meeting_message(message=message, chatroom=self.chat_api.apex_chat)

	def send_jira_update(self, key, msrp, summary, username, ping_message, sprint, epic_link):
		"""Send a Jira ticket update to a user."""
		if ping_message in ['Merge Conflict','Code Review - Failed','UCT - Failed','UCT - Failed','QA - Failed']:
			self._send_fail(key=key, msrp=msrp, summary=summary, username=username, type_comp=ping_message)
		elif ping_message == 'Merge Code':
			self.send_merge_needed(key=key, msrp=msrp, summary=summary, username=username, sprint=sprint, epic_link=epic_link)

	def _send_fail(self, key, msrp, summary, username, type_comp):
		"""Send a fail type Jira status to a user."""
		branch = get_branch_name(username=username, msrp=msrp, summary=summary)
		data = {
			"branch": branch,
			"type_message": type_comp,
			"key": key
		}

		message = build_message(data=data, jira_message=True, branch_message=True)

		if(username not in self.chat_api.project_managers):
			self.chat_api.send_message(message=message, username=username)

	def send_pcr_comments(self, fromName, toUsername, pullLinks, key):
		"""Send PCR need addressing notification to a user."""
		message = f"<br> \
			You Have PCR comments to address from {fromName} for <a href='{self.chat_api.jira_ticket_base}/{key}'>{key}</a>: <br> \
				<table style='{table_style}'> \
			"

		idx = 0
		for link in pullLinks:
			coloredRow = ''

			if idx % 2 == 1:
				coloredRow = td_alt_style
			idx = idx+1

			repo = link['repo']
			link = link['link']

			message += f"<tr> \
					<td style='{td_style} {coloredRow}'><a href='{link}'>{repo}</a></td> \
				</tr>"

		message += '</table>'
		return self.chat_api.send_message(message=message, username=toUsername)