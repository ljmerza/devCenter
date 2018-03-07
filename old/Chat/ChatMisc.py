#!/usr/bin/python3

import os
import ChatUtils

class ChatMisc():
	'''
	'''

	def __init__(self, chat_api, merge_alerts):
		'''
		'''
		self.chat_api = chat_api
		self.merge_alerts = merge_alerts

	def send_new_ticket(self, key, msrp, summary, username, story_point, pcr_estimate):
		'''send crucible title and link for a new jira ticket
		Args:
			key (str) the Jira key
			msrp (str) the Jira MSRP
			sprint (str) the sprint name
			summary (str) the summary of the Jira ticket
			username (str) the username to send the ping to
			story_point (str) the story points of the Jira issue
			pcr_estimate (str) the PCR estimate number
		Returns:
			None
		'''
		# get branch, pcr estimate, and time estimate
		branch = ChatUtils.get_branch_name(username=username, msrp=msrp, summary=summary)
		estimate = ChatUtils.get_estimate_string(story_point=story_point)
		# create data JSON
		data = {
			"summary": summary,
			"msrp": msrp,
			"branch": branch,
			"pcr_estimate": pcr_estimate,
			"estimate": estimate,
			"key": key,
			"type_message": 'New Ticket'
		}
		# build message HTML
		message = ChatUtils.build_message(data=data, msrp_message=True, jira_message=True, branch_message=True, summary_message=True, estimate_message=True, crucible_title_message=True)
		# if username is not a PM then ping
		if(username not in self.chat_api.project_managers):
			return self.chat_api.send_message(message=message, username=username)
			
	def send_merge_needed(self, key, msrp, summary, username, sprint):
		'''set user to send message, create message and send message for merge code
		Args:
			key (str) the Jira key
			msrp (str) the Jira MSRP
			summary (str) the summary of the Jira ticket
			username (str) the username to send the ping to
			sprint (str) the sprint of the Jira issue
		Returns:
			None
		'''
		# get branch name and format sprint name
		branch = ChatUtils.get_branch_name(username=username, msrp=msrp, summary=summary)
		sprint = sprint.replace(" ", "")
		# set data object to create message
		data = {
			"summary": summary,
			"msrp": msrp,
			"key": key,
			"sprint": sprint,
			"branch": branch,
			"type_message": 'Merge needed'
		}
		# create message
		message = ChatUtils.build_message(data=data, commit_message=True, jira_message=True, branch_message=True, sprint_message=True)
		# if username is not a PM then ping
		if(username not in self.chat_api.project_managers):
			return self.chat_api.send_message(message=message, username=username)

	def send_merge_alert(self, key, msrp, sprint, username, repos_merged, crucible_id, summary):
		'''
		Args:
			key (str) the Jira key
			msrp (str) the Jira MSRP
			sprint (str) the sprint of the Jira issue
			username (str) the username to send the ping to
			repos_merged (array<str>) an array of repo names
			crucible_id (str) the Crucible ID tied to this Jira issue
			summary (str) - the summary of the Jira issue
		Returns:
			None
		'''
		# get index of last repo
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
		message += f" for '{summary}'  on sprint {sprint} has been updated by {username} - <a href='{self.chat_api.crucible_ticket_base}{crucible_id}'>Crucible</a> <a href='{self.chat_api.jira_ticket_base}{key}'>Jira</a>"
		# set to jira chatroom unless merger_alert flag set then set to apex chat
		chatroom = self.chat_api.jira_chat
		if self.merge_alerts:
			chatroom = self.chat_api.apex_chat
		# send message
		self.chat_api.send_meeting_message(message=message, chatroom=chatroom)

	def beta_statistics(self, uct, pcr, qa, cr, beta):
		'''create html for beta stats
		Args:
			uct (str) the number of uct tickets
			pcr (str) the number of pcr tickets
			qa (str) the number of qa tickets
			cr (str) the number of cr tickets
			beta (str) the number of beta tickets
		Returns:
			None
		'''
		# create message HTML
		message = f"<br> \
			Beta Statistics: <br> \
				<table style='{ChatUtils.table_style}'> \
					<tr> \
						<td style='{ChatUtils.td_style}'>UCT ready</td> \
						<td style='{ChatUtils.td_style}'>{uct}</td> \
					</tr> \
					<tr> \
						<td style='{ChatUtils.td_style} {ChatUtils.td_alt_style}'>PCR needed</td> \
						<td style='{ChatUtils.td_style} {ChatUtils.td_alt_style}'>{pcr}</td> \
					</tr> \
					<tr> \
						<td style='{ChatUtils.td_style}'>QA needed</td> \
						<td style='{ChatUtils.td_style}'>{qa}</td> \
					</tr> \
					<tr> \
						<td style='{ChatUtils.td_style} {ChatUtils.td_alt_style}'>CR Needed/Working</td> \
						<td style='{ChatUtils.td_style} {ChatUtils.td_alt_style}'>{cr}</td> \
					</tr> \
					<tr> \
						<td style='{ChatUtils.td_style}'>Beta Tickets</td> \
						<td style='{ChatUtils.td_style}'>{beta}</td> \
					</tr> \
				 </table>"
		# send message
		self.chat_api.send_meeting_message(message=message, chatroom=self.chat_api.apex_chat)

	def send_jira_update(self, key, msrp, summary, username, ping_message, sprint):
		'''send an update about the status of a Jira issue
		Args:
			key (str) the Jira key
			msrp (str) the Jira MSRP
			summary (str) - the summary of the Jira issue
			username (str) the username to send the ping to
			ping_message (tr) the type of Jira status
			sprint (str) the sprint of the Jira issue
		Returns:
			None
		'''
		# if one of these statuses then send fail
		if ping_message in ['Merge Conflict','Code Review - Failed','UCT - Failed','UCT - Failed','QA - Failed']:
			self._send_fail(key=key, msrp=msrp, summary=summary, username=username, type_comp=ping_message)
		# else if a merge code status then send merge code
		elif ping_message == 'Merge Code':
			self.send_merge_needed(key=key, msrp=msrp, summary=summary, username=username, sprint=sprint)

	def _send_fail(self, key, msrp, summary, username, type_comp):
		'''general method to send a failed component
		Args:
			key (str) the Jira key
			msrp (str) the Jira MSRP
			summary (str) - the summary of the Jira issue
			username (str) the username to send the ping to
			type_comp (str) the type of fail
		Returns:
			None
		'''
		# get branch
		branch = ChatUtils.get_branch_name(username=username, msrp=msrp, summary=summary)
		# set data object to create message
		data = {
			"branch": branch,
			"type_message": type_comp,
			"key": key
		}
		# create message
		message = ChatUtils.build_message(data=data, jira_message=True, branch_message=True)
		# if username is not a PM then ping
		if(username not in self.chat_api.project_managers):
			self.chat_api.send_message(message=message, username=username)

	


	