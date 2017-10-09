#!/usr/bin/python3

import math
import requests
from requests.auth import HTTPBasicAuth
import re
import string
import os

class Qbot(object):	
	def __init__(self, debug, is_qa_pcr, merge_alerts):
		self.crucible_url = os.environ['CRUCIBLE_URL']
		self.jira_url = os.environ['JIRA_URL']
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
		self.qbot_api = f'{self.qBot_url}/push'
		self.qbot_api_chatroom = f'{self.qbot_api}/meeting:'
		##########################################################
		pm1 = os.environ['PM1']
		pm2 = os.environ['PM2']
		self.never_ping_pms = [pm1, pm2]
		##########################################################
		self.td_style = "border: 1px solid #dddddd;padding: 8px;"
		self.td_alt_style = "background-color: #dddddd;"
		self.table_style = "border-collapse: collapse;"
		self.trantab = "".maketrans(",!.;:/\\()@#$%^&*[]'<>|~`", "------------------------")
		##########################################################

	def _get_estimate_string(self, story_point):
		'''calculate the time estimate from the story points


		'''
		if(story_point):
			if(story_point < 1):
				story_point = str(int(8*story_point)) + ' hours'
			elif(story_point // 5 >= 1):

				week = story_point // 5
				days = story_point % 5
				story_point = str(int(week)) + ' week'
				if(days >= 1):
					story_point = story_point + ' ' + str(days) + ' days'
			elif(story_point == 1):
				story_point = str(int(story_point)) + ' day'
			else:
				story_point = str(int(story_point)) + ' days'
		return story_point

	def send_pcr_needed(self, pcr_estimate, key, msrp, sprint, labels, crucible_link, send_to_me=False):
		'''send pcr needed to chat room


		'''
		# create message string
		message = f'PCR-{pcr_estimate}'
		# if BETA ticket then add beta string
		if 'BETA' in labels:
			message += ' BETA'
		# send message
		self.get_qa_pcr_links(message=message, sprint=sprint, key=key, msrp=msrp, crucible_link=crucible_link)
		
	def send_qa_needed(self, key, sprint, msrp, labels, crucible_link):
		'''send qa needed to chat room


		'''
		# create message string
		message = ''
		# if BETA ticket then add beta string
		if 'BETA' in labels:
			message += 'BETA '
		# add messge type
		message += 'QA Needed'
		# send message
		self.get_qa_pcr_links(message=message, sprint=sprint, key=key, msrp=msrp, crucible_link=crucible_link)


	def get_qa_pcr_links(self, message, sprint, key, msrp, crucible_link):
		'''get jira/crucible links along with sprint and send message to chatroom

		'''
		# if fasttrack or SASHA ticket then dont ping
		if ('FastTrack' in sprint) or ('SASHA' in key):
			return
		# add key and MSRP to ticket
		message += f" [{key}] Ticket #{msrp}:"
		# if we have crucible link -> add crucible
		if crucible_link:
			message += f" <a href='{crucible_link}'>Crucible</a>"
		# add jira link
		message += f" <a href='{self.ticket_base}/{key}'>Jira</a>"
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

		'''
		# get branch, pcr estimate, and time estimate
		branch = self.get_branch_name(username=username, msrp=msrp, summary=summary)
		estimate = self._get_estimate_string(story_point=story_point)
		# create data JSON
		data = {
			"summary": summary,
			"msrp": msrp,
			"sprint": sprint,
			"branch": branch,
			"pcr_estimate": pcr_estimate,
			"key": key,
			"type_message": 'New Ticket'
		}
		# build message HTML
		message = self.build_message(data=data, msrp_message=True, 
			jira_message=True, branch_message=True, summary_message=True, estimate_message=True, crucible_title_message=True)
		# if username is not a PM then ping
		if(username not in self.never_ping_pms):
			self.send_message(message=message, username=username)
			
	
	def send_me_ticket_info(self, key, summary, username, ping_message):
		'''send me the new ticket
		'''
		self.send_message(message=f"{ping_message} <a href='{self.ticket_base}/{key}'>{key}</a> {summary} {username}", username=self.username)

	def send_merge_needed(self, key, msrp, summary, username, sprint):
		'''set user to send message, create message and send message for merge code
		'''
		# get branch name and format sprint name
		branch = self.get_branch_name(username=username, msrp=msrp, summary=summary)
		sprint = sprint.replace(" ", "")
		# sewt data object to create message
		data = {
			"summary": summary,
			"msrp": msrp,
			"sprint": sprint,
			"branch": branch,
			"type_message": 'Merge needed'
		}
		# create message
		message = self.build_message(data=data, commit_message=True, jira_message=True, branch_message=True, sprint_message=True)
		# if username is not a PM then ping
		if(username not in self.never_ping_pms):
			self.send_message(message=message, username=username)

	def send_merge_alert(self, key, msrp, sprint, username, repos_merged, crucible_link, summary):
		'''

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
		message += f" for '{summary}'  on sprint {sprint} has been updated by {username} - <a href='{crucible_link}'>Crucible</a> <a href='{self.ticket_base}/{key}'>Jira</a>"
		# set to jira chatroom unless merger_alert flag set then set to apex chat
		chatroom = self.jira_chat
		if self.merge_alerts:
			chatroom = self.apex_chat
		# send message
		self.send_meeting_message(message=message, chatroom=chatroom)

	def beta_statistics(self, uct, pcr, qa, cr, beta):
		'''create html for beta stats
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
		self.send_meeting_message(message=message)

	def _send_fail(self, key, msrp, summary, username, type_comp):
		'''general method to send a failed component
		'''
		# get branch
		branch = self.get_branch_name(username=username, msrp=msrp, summary=summary)
		# set data object to create message
		data = {
			"branch": branch,
			"type_message": type_comp
		}
		# create message
		message = self.build_message(data=data, jira_message=True, branch_message=True)
		# if username is not a PM then ping
		if(username not in self.never_ping_pms):
			self.send_message(message=message, username=username)

	def send_jira_update(self, key, msrp, summary, username, ping_message, sprint):
		'''
		'''
		# if one of these statuses then send fail
		if ping_message in ['Merge Conflict','Code Review - Failed','UCT - Failed','UCT - Failed','QA - Failed']:
			self._send_fail(key=key, msrp=msrp, summary=summary, username=username, type_comp=ping_message)
		# else if a merge code status then send merge code
		elif ping_message == 'Merge Code':
			self.send_merge_needed(key=key, msrp=msrp, summary=summary, username=username, sprint=sprint)

	def send_message(self, message, username):
		'''make a POST request to the qBot to send a message
		'''
		# if in debug mode then send all messages to me
		if(self.debug):
			username = self.username
		# make POST request
		requests.post(f"{self.qbot_api}/{username}", data=message, auth=HTTPBasicAuth(self.bot_name, self.bot_password))

	def send_meeting_message(self, message, chatroom):
		'''make a post request to the qBot to send a message to a chat room
		'''
		# if in debug mode then send all message to test chatroom
		if self.debug:
			chatroom = self.bot_test
		# make POST request
		requests.post(f"{self.qbot_api_chatroom}{chatroom}", data=message, auth=HTTPBasicAuth(self.bot_name, self.bot_password))

	def get_branch_name(self, username, msrp, summary):
		'''get the branch name in username-msrp-summary format
		'''
		branch = summary.translate(self.trantab)
		branch = branch.replace(" - ",'-')
		branch = branch.replace(" ",'-')
		branch = branch.replace("--",'-')
		branch = branch.replace("---",'-')
		# if summary starts with a dash then get rid of it
		if branch.startswith('-'):
			branch = branch[1:]

		return f"{username}-{msrp}-{branch}"


	def build_message(self, data, commit_message=False, jira_message=False, branch_message=False, 
		sprint_message=False, msrp_message=False, summary_message=False, crucible_title_message=False, estimate_message=False):
		'''
		'''

		# make message table and the type of message string
		type_message = data['type_message']
		message = f"{type_message}: <br> <table style='{self.table_style}'>"
		# add commit message
		if commit_message:
			msrp = data['msrp']
			key = data['key']
			summary = data['summary']
			message += "\
			<tr> \
				<td style='{self.td_style}'>Commit Message</td> \
				<td style='{self.td_style}'>[{key}] Ticket #{msrp} {summary}</td> \
			</tr>" 
		# add Jira link
		if jira_message:
			key = data['key']
			message += "\
			<tr> \
				<td style='{self.td_style} {self.td_alt_style}'>Jira Link</td> \
				<td style='{self.td_style} {self.td_alt_style}'><a href='{self.ticket_base}/{key}'>{self.ticket_base}/{key}</a></td> \
			</tr>"
		# add branch name
		if branch_message:
			branch = data['branch']
			message += "\
			<tr> \
				<td style='{self.td_style}'>Branch</td> \
				<td style='{self.td_style}'>{branch}</td> \
			</tr>"
		# add sprint
		if sprint_message: 
			sprint = data['sprint']
			message += "\
			<tr> \
				<td style='{self.td_style}'>Sprint</td> \
				<td style='{self.td_style}'>{sprint}</td> \
			</tr>"
		# add MSRP number
		if msrp_message:
			msrp = data['msrp']	
			message += "\
			<tr> \
				<td style='{self.td_style} {self.td_alt_style}'>MSRP</td> \
				<td style='{self.td_style} {self.td_alt_style}'>{msrp}</td> \
			</tr>"
		# add summary
		if summary_message:
			summary = data['summary']
			message += "\
			<tr> \
				<td style='{self.td_style}'>Summary</td> \
				<td style='{self.td_style}'>{summary}</td> \
			</tr>"
		# add estimate
		if estimate_message:
			estimate = data['estimate']
			message += "\
			<tr> \
				<td style='{self.td_style}'>Estimate</td> \
				<td style='{self.td_style}'>{estimate}</td> \
			</tr>"
		# add crucible title format
		if crucible_title_message:
			pcr_estimate = data['pcr_estimate']
			key = data['key']
			msrp = data['msrp']
			summary = data['summary']
			message += "\
			<tr> \
				<td style='{self.td_style} {self.td_alt_style}'>Crucible Title</td> \
				<td style='{self.td_style} {self.td_alt_style}'>(PCR-{pcr_estimate}) [{key}] Ticket #{msrp} {summary}</td>\
			</tr>"
		# close table and return message string
		message += "</table>"
		return message