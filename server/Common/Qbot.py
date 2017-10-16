#!/usr/bin/python3

import math
import requests
from requests.auth import HTTPBasicAuth
import re
import os

class Qbot(object):	
	def __init__(self, debug, is_qa_pcr, merge_alerts):
		self.crucible_url = os.environ['CRUCIBLE_URL']
		self.crucible_ticket_base = f'{self.crucible_url}/cru'
		self.jira_url = os.environ['JIRA_URL']
		self.jira_ticket_base = f'{self.jira_url}/browse'
		##########################################################
		self.username = os.environ['USER']
		self.debug = debug
		self.is_qa_pcr = is_qa_pcr
		self.merge_alerts = merge_alerts
		##########################################################
		self.bot_name = os.environ['BOT_NAME']
		self.bot_password = os.environ['BOT_PASSWORD']
		##########################################################
		self.apex_chat = os.environ['QCHAT_APEX']
		self.dti_chat = os.environ['QCHAT_DTI']
		self.test_chat = os.environ['QCHAT_TEST']
		self.jira_chat = os.environ['QCHAT_JIRA']
		##########################################################
		self.qbot_url = os.environ['QBOT_URL']
		self.qbot_api = f'{self.qbot_url}/push'
		self.qbot_api_chatroom = f'{self.qbot_api}/meeting:'
		self.qbot_api_menu = f'{self.qbot_api}/menu/'
		##########################################################
		self.project_managers = os.environ['PM'].split(',')
		##########################################################
		self.td_style = "border: 1px solid #dddddd;padding: 8px;"
		self.td_alt_style = "background-color: #dddddd;"
		self.table_style = "border-collapse: collapse;"
		self.trantab = "".maketrans(",!.;:/\\()@#$%^&*[]'<>|~`", "------------------------")
		##########################################################

	def _get_estimate_string(self, story_point):
		'''calculate the time estimate from the story points
		Args:
			story_point (int) the number of story points for a Jira issue

		Returns:
			the time string representation of the story points
		'''
		if(story_point):
			if(story_point < 1):
				story_point = str(int(8*story_point)) + ' hours'
			elif(story_point // 5 >= 1):

				week = story_point // 5
				days = story_point % 5
				story_point = str(int(week)) + ' week'
				if(days >= 1):
					story_point = story_point + ' ' + str(days)
					if days == 1:
						story_point += ' day'
					else:
						story_point += ' days'
			elif(story_point == 1):
				story_point = str(int(story_point)) + ' day'
			else:
				story_point = str(int(story_point)) + ' days'
		return story_point

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
		if 'BETA' in label:
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
			message += f" <a href='{self.crucible_ticket_base}/{crucible_id}'>Crucible</a>"
		# add jira link
		message += f" <a href='{self.jira_ticket_base}/{key}'>Jira</a>"
		# add sprint if exists
		if sprint:
			message += f" Sprint: {sprint}"

		# send to jira  chat unless is_pcr_qa flag set -> then apex chat
		chatroom = self.jira_chat
		if self.is_qa_pcr:
			chatroom = self.apex_chat
		# send message
		self.send_meeting_message(message=message, chatroom=chatroom)
		
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
		branch = self.get_branch_name(username=username, msrp=msrp, summary=summary)
		estimate = self._get_estimate_string(story_point=story_point)
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
		message = self.build_message(data=data, msrp_message=True, 
			jira_message=True, branch_message=True, summary_message=True, estimate_message=True, crucible_title_message=True)
		# if username is not a PM then ping
		if(username not in self.project_managers):
			self.send_message(message=message, username=username)
			
	
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
		self.send_message(message=f"{ping_message} <a href='{self.jira_ticket_base}{key}'>{key}</a> {summary} {username}", username=self.username)

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
		branch = self.get_branch_name(username=username, msrp=msrp, summary=summary)
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
		message = self.build_message(data=data, commit_message=True, jira_message=True, branch_message=True, sprint_message=True)
		# if username is not a PM then ping
		if(username not in self.project_managers):
			self.send_message(message=message, username=username)

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
		message += f" for '{summary}'  on sprint {sprint} has been updated by {username} - <a href='{self.crucible_ticket_base}{crucible_id}'>Crucible</a> <a href='{self.jira_ticket_base}{key}'>Jira</a>"
		# set to jira chatroom unless merger_alert flag set then set to apex chat
		chatroom = self.jira_chat
		if self.merge_alerts:
			chatroom = self.apex_chat
		# send message
		self.send_meeting_message(message=message, chatroom=chatroom)

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
				<table style='{self.table_style}'> \
					<tr> \
						<td style='{self.td_style}'>UCT ready</td> \
						<td style='{self.td_style}'>{uct}</td> \
					</tr> \
					<tr> \
						<td style='{self.td_style} {self.td_alt_style}'>PCR needed</td> \
						<td style='{self.td_style} {self.td_alt_style}'>{pcr}</td> \
					</tr> \
					<tr> \
						<td style='{self.td_style}'>QA needed</td> \
						<td style='{self.td_style}'>{qa}</td> \
					</tr> \
					<tr> \
						<td style='{self.td_style} {self.td_alt_style}'>CR Needed/Working</td> \
						<td style='{self.td_style} {self.td_alt_style}'>{cr}</td> \
					</tr> \
					<tr> \
						<td style='{self.td_style}'>Beta Tickets</td> \
						<td style='{self.td_style}'>{beta}</td> \
					</tr> \
				 </table>"
		# send message
		self.send_meeting_message(message=message, chatroom=self.apex_chat)

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
		branch = self.get_branch_name(username=username, msrp=msrp, summary=summary)
		# set data object to create message
		data = {
			"branch": branch,
			"type_message": type_comp,
			"key": key
		}
		# create message
		message = self.build_message(data=data, jira_message=True, branch_message=True)
		# if username is not a PM then ping
		if(username not in self.project_managers):
			self.send_message(message=message, username=username)

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

	def send_message(self, message, username):
		'''make a POST request to the qBot to send a message
		Args:
			message (str) - the message to send to the user
			username (str) the username to send the ping to
		Returns:
			None
		'''
		# if in debug mode then send all messages to me
		if(self.debug):
			username = self.username
		# make POST request
		requests.post(f"{self.qbot_api}/{username}", data=message, auth=HTTPBasicAuth(self.bot_name, self.bot_password))

	def send_meeting_message(self, message, chatroom):
		'''make a post request to the qBot to send a message to a chat room

		Args:
			message (str) - the message to send to the chatroom
			chatroom (str) the chatroom ID to send the ping to

		Returns:
			None
		'''
		# if in debug mode then send all message to test chatroom
		if self.debug:
			chatroom = self.test_chat
		# make POST request
		requests.post(f"{self.qbot_api_chatroom}{chatroom}", data=message, auth=HTTPBasicAuth(self.bot_name, self.bot_password))

	def set_z_menu(self, username):
		'''
		Args:
			username - the username of the user to add the menu to

		Returns:
			None
		'''
		requests.post(f"{self.qbot_api_menu}{username}", data='', auth=HTTPBasicAuth(self.bot_name, self.bot_password))

	def get_branch_name(self, username, msrp, summary):
		'''get the branch name in username-msrp-summary format
		Args:
			username (str) the username to send the ping to
			msrp (str) - the MSRP of the ticket
			summary (str) - the summary of the ticket
		Returns:
			the branch name
		'''
		branch = summary.translate(self.trantab)
		branch = re.sub(r" +", '-', branch)
		branch = re.sub(r"-+", '-', branch)
		# if summary starts/ends with a dash then get rid of it
		if branch.startswith('-'):
			branch = branch[1:]
		if branch.endswith('-'):
			branch = branch[:-1]
		# create branch name and make sure over 30 chars
		branch_name = f"{username}-{msrp}-{branch}"
		if len(branch_name) < 30:
			while len(branch_name) < 30:
				branch_name += f'-{msrp}'
		return branch_name


	def build_message(self, data, commit_message=False, jira_message=False, branch_message=False, crucible_message=False,
		sprint_message=False, msrp_message=False, summary_message=False, crucible_title_message=False, estimate_message=False):
		'''builds a custom HTML message to send
		Args:
			data (dict<string>) a dict of values to use while building the HTML
			commit_message (boolean) adds the commit string when commiting to git
			jira_message (boolean) adds the jira link
			branch_message (boolean) adds the branch name
			crucible_message (boolean) adds the crucible link
			sprint_message (boolean) adds the sprint
			msrp_message (boolean) adds the MSRP number
			summary_message (boolean) adds the summary of the ticket
			crucible_title_message (boolean) adds the generated crucible title
			estimate_message (boolean) adds the estimate time string
		Returns:
			the HTML to use as a message
		'''
		# keep track of odd table rows
		color_bg = 0
		# make message table and the type of message string
		type_message = data['type_message']
		message = f"{type_message}: <br> <table style='{self.table_style}'>"
		# add commit message
		if commit_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg +=1
			if color_bg % 2 == 1:
				color = self.td_alt_style
			else:
				color = ''
			# get data
			msrp = data['msrp']
			key = data['key']
			summary = data['summary']
			message += f"\
			<tr> \
				<td style='{self.td_style} {color}'>Commit Message</td> \
				<td style='{self.td_style} {color}'>[{key}] Ticket #{msrp} {summary}</td> \
			</tr>" 
		# add Jira link
		if jira_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg +=1
			if color_bg % 2 == 1:
				color = self.td_alt_style
			else:
				color = ''
			# get data
			key = data['key']
			message += f"\
			<tr> \
				<td style='{self.td_style} {color}'>Jira Link</td> \
				<td style='{self.td_style} {color}'><a href='{self.jira_ticket_base}/{key}'>{self.jira_ticket_base}/{key}</a></td> \
			</tr>"
		# add crucible link
		if crucible_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg +=1
			if color_bg % 2 == 1:
				color = self.td_alt_style
			else:
				color = ''
			# get data
			crucible_id = data['crucible_id']
			message += f"\
			<tr> \
				<td style='{self.td_style} {color}'>Crucible Link</td> \
				<td style='{self.td_style} {color}'><a href='{self.crucible_ticket_base}/{crucible_id}'>{self.crucible_ticket_base}/{crucible_id}</a></td> \
			</tr>"
		# add branch name
		if branch_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg +=1
			if color_bg % 2 == 1:
				color = self.td_alt_style
			else:
				color = ''
			# get data
			branch = data['branch']
			message += f"\
			<tr> \
				<td style='{self.td_style} {color}'>Branch</td> \
				<td style='{self.td_style} {color}'>{branch}</td> \
			</tr>"
		# add sprint
		if sprint_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg +=1
			if color_bg % 2 == 1:
				color = self.td_alt_style
			else:
				color = ''
			# get data
			sprint = data['sprint']
			message += f"\
			<tr> \
				<td style='{self.td_style} {color}'>Sprint</td> \
				<td style='{self.td_style} {color}'>{sprint}</td> \
			</tr>"
		# add MSRP number
		if msrp_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg +=1
			if color_bg % 2 == 1:
				color = self.td_alt_style
			else:
				color = ''
			# get data
			msrp = data['msrp']	
			message += f"\
			<tr> \
				<td style='{self.td_style} {color}'>MSRP</td> \
				<td style='{self.td_style} {color}'>{msrp}</td> \
			</tr>"
		# add summary
		if summary_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg +=1
			if color_bg % 2 == 1:
				color = self.td_alt_style
			else:
				color = ''
			# get data
			summary = data['summary']
			message += f"\
			<tr> \
				<td style='{self.td_style} {color}'>Summary</td> \
				<td style='{self.td_style} {color}'>{summary}</td> \
			</tr>"
		# add estimate
		if estimate_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg +=1
			if color_bg % 2 == 1:
				color = self.td_alt_style
			else:
				color = ''
			# get data
			estimate = data['estimate']
			message += f"\
			<tr> \
				<td style='{self.td_style} {color}'>Estimate</td> \
				<td style='{self.td_style} {color}'>{estimate}</td> \
			</tr>"
		# add crucible title format
		if crucible_title_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg +=1
			if color_bg % 2 == 1:
				color = self.td_alt_style
			else:
				color = ''
			# get data
			pcr_estimate = data['pcr_estimate']
			key = data['key']
			msrp = data['msrp']
			summary = data['summary']
			message += f"\
			<tr> \
				<td style='{self.td_style} {color}'>Crucible Title</td> \
				<td style='{self.td_style} {color}'>(PCR-{pcr_estimate}) [{key}] Ticket #{msrp} {summary}</td>\
			</tr>"
		# close table and return message string
		message += "</table>"
		return message