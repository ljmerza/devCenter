#!/usr/bin/python3

import math
import requests
from requests.auth import HTTPBasicAuth
import re
import string
import os

class Qbot(object):	
	def __init__(self, ticket_base, debug, is_qa_pcr, merge_alerts):
		self.ticket_base = ticket_base
		self.attuid = os.environ['USER']
		self.debug = debug
		self.is_qa_pcr = is_qa_pcr
		self.merge_alerts = merge_alerts
		##########################################################
		self.bot_name = os.environ['BOT_NAME']
		self.bot_password = os.environ['BOT_PASSWORD']
		##########################################################
		self.APEX = 'q_rooms_ep759g1469815893161'
		self.DTI = 'q_rooms_mk08171393514273394'
		self.bot_test = 'q_rooms_lm240n1496153721334'
		self.jira_chat = 'q_rooms_lm240n1503605564035'
		self.apex_chat = 'q_rooms_ep759g1469815893161'
		##########################################################
		self.qBot_url = 'http://chatbots.q.att.com:19221'
		self.qBot_api = f'{self.qBot_url}/push'
		##########################################################
		self.dont_ping = ['lk2973', 'ep759g']
		##########################################################
		self.td_style = "border: 1px solid #dddddd;padding: 8px;"
		self.td_alt_style = "background-color: #dddddd;"
		self.table_style = "border-collapse: collapse;"
		# self.trantab = string.maketrans(",!.;:/\\()@#$%^&*[]'<>|~`", "------------------------")
		self.trantab = "".maketrans(",!.;:/\\()@#$%^&*[]'<>|~`", "------------------------")
		##########################################################

	def _get_estimate_string(self, story_point):
		'''calculate the time estimate from the story points'''
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
		'''send pcr needed to chat room'''
		# get pcr number, create and send message
		message = f'PCR-{pcr_estimate}'
		if 'BETA' in labels:
			message += ' BETA'
		self.get_qa_pcr_links(message=message, sprint=sprint, key=key, msrp=msrp, crucible_link=crucible_link)
		
	def send_qa_needed(self, key, sprint, msrp, labels, crucible_link):
		'''send qa needed to chat room'''
		# create and send message
		message = ''
		if 'BETA' in labels:
			message += 'BETA '
		message += 'QA Needed'
		self.get_qa_pcr_links(message=message, sprint=sprint, key=key, msrp=msrp, crucible_link=crucible_link)


	def get_qa_pcr_links(self, message, sprint, key, msrp, crucible_link):
		'''get jira/crucible links along with sprint and send message to chatroom'''
		# if fasttrack ticket then dont ping
		if 'FastTrack' in sprint:
			return
		# if we have crucible link add crucible
		message += f" [{key}] Ticket #{msrp}:"
		if crucible_link:
			message += f" <a href='{crucible_link}'>Crucible</a>"
		# add jira link
		message += f" <a href='{self.ticket_base}/{key}'>Jira</a>"
		# add sprint if exists
		if sprint:
			message += f" Sprint: {sprint}"
		if 'SASHA' not in key:
			# send to jira notification
			chatroom = self.jira_chat
			if self.is_qa_pcr:
				chatroom = self.apex_chat
			self.send_meeting_message(message=message, chatroom=chatroom)
		
	def send_new_ticket(self, key, msrp, summary, attuid, story_point, pcr_estimate):
		'''send crucible title and link for a new jira ticket'''
		# get branch, pcr estimate, and time estimate
		branch = self.get_branch_name(attuid=attuid, msrp=msrp, summary=summary)
		estimate = self._get_estimate_string(story_point=story_point)
		
		# create message to send
		message = f"New Ticket: <br> \
					<table style='{self.table_style}'> \
						<tr> \
							<td style='{self.td_style}'>Jira Link</td> \
					    	<td style='{self.td_style}'><a href='{self.ticket_base}/{key}'>{self.ticket_base}/{key}</a></td> \
					  	</tr> \
					  	<tr> \
					    	<td style='{self.td_style} {self.td_alt_style}'>MSRP</td> \
					    	<td style='{self.td_style} {self.td_alt_style}'>{msrp}</td> \
					  	</tr> \
					  	<tr> \
					    	<td style='{self.td_style}'>Summary</td> \
					    	<td style='{self.td_style}'>{summary}</td> \
					  	</tr> \
					  	<tr> \
					    	<td style='{self.td_style} {self.td_alt_style}'>Branch</td> \
					    	<td style='{self.td_style} {self.td_alt_style}'>{branch}</td> \
					  	</tr> \
					  <tr> \
					    	<td style='{self.td_style}'>Estimate</td> \
					    	<td style='{self.td_style}'>{estimate}</td> \
					  	</tr> \
					  	<tr> \
					    	<td style='{self.td_style} {self.td_alt_style}'>Crucible Title</td> \
					    	<td style='{self.td_style} {self.td_alt_style}'>(PCR-{pcr_estimate}) [{key}] Ticket #{msrp} {summary}</td>\
					  	</tr> \
					 </table>"
		if(attuid not in self.dont_ping):
			self.send_message(message=message, attuid=attuid)
			
	
	def send_me_ticket_info(self, key, summary, attuid, ping_message):
		'''send me the new ticket'''
		self.send_message(message=f"{ping_message} <a href='{self.ticket_base}/{key}'>{key}</a> {summary} {attuid}", attuid=self.attuid)

	def send_merge_needed(self, key, msrp, summary, attuid, sprint):
		'''set user to send message, create message and send message for merge code'''
		branch = self.get_branch_name(attuid=attuid, msrp=msrp, summary=summary)
		sprint = sprint.replace(" ", "")
		message = f"Merge needed: <br> \
					<table style='{self.table_style}'> \
						<tr> \
							<td style='{self.td_style}'>Commit Message</td> \
					    	<td style='{self.td_style}'>[{key}] Ticket #{msrp} {summary}</td> \
					  	</tr> \
					  	<tr> \
					    	<td style='{self.td_style} {self.td_alt_style}'>Jira Link</td> \
					    	<td style='{self.td_style} {self.td_alt_style}'><a href='{self.ticket_base}/{key}'>{self.ticket_base}/{key}</a></td> \
					  	</tr> \
					  	<tr> \
					    	<td style='{self.td_style}'>Branch</td> \
					    	<td style='{self.td_style}'>{branch}</td> \
					  	</tr> \
					  	<tr> \
					    	<td style='{self.td_style}'>Sprint</td> \
					    	<td style='{self.td_style}'>{sprint}</td> \
					  	</tr> \
					 </table>"
		if(attuid not in self.dont_ping):
			self.send_message(message=message, attuid=attuid)

	def send_merge_alert(self, key, msrp, sprint, attuid, repos_merged, crucible_link, summary):
		# get index of last repo
		message = ''
		last_repo_index = len(repos_merged) -1
		# generate list of repos
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
		message += f" for '{summary}'  on sprint {sprint} has been updated by {attuid} - <a href='{crucible_link}'>Crucible</a> <a href='{self.ticket_base}/{key}'>Jira</a>"
		# send message
		if self.debug:
			self.send_message(message=message, attuid=self.attuid)
		# send to chatroom
		chatroom = self.jira_chat
		if self.merge_alerts:
			chatroom = self.apex_chat
		self.send_meeting_message(message=message, chatroom=chatroom)
	def beta_statistics(self, uct, pcr, qa, cr, beta):
		'''create html for beta stats'''
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
		self.send_meeting_message(message=message)

	def _send_fail(self, key, msrp, summary, attuid, type_comp):
		'''general method to send a failed component'''
		branch = self.get_branch_name(attuid=attuid, msrp=msrp, summary=summary)
		message = f"{type_comp} <br> \
					<table style='{self.table_style}'> \
					  	<tr> \
					    	<td style='{self.td_style}'>Jira Link</td> \
					    	<td style='{self.td_style}'><a href='{self.ticket_base}/{key}'>{self.ticket_base}/{key}</a></td> \
					  	</tr> \
					  	<tr> \
					    	<td style='{self.td_style} {self.td_alt_style}'>Branch</td> \
					    	<td style='{self.td_style} {self.td_alt_style}'>{branch}</td> \
					  	</tr> \
					 </table>"
		if(attuid not in self.dont_ping):
			self.send_message(message=message, attuid=attuid)

	def send_jira_update(self, key, msrp, summary, attuid, ping_message, sprint):
		if ping_message in ['Merge Conflict','Code Review - Failed','UCT - Failed','UCT - Failed','QA - Failed']:
			self._send_fail(key=key, msrp=msrp, summary=summary, attuid=attuid, type_comp=ping_message)
		elif ping_message == 'Merge Code':
			self.send_merge_needed(key=key, msrp=msrp, summary=summary, attuid=attuid, sprint=sprint)

	def send_message(self, message, attuid):
		if(self.debug):
			attuid = self.attuid
		'''make a post request to the qBot to send a message'''
		requests.post(f"{self.qBot_api}/{attuid}", data=message, auth=HTTPBasicAuth(self.bot_name, self.bot_password))

	def send_meeting_message(self, message, chatroom):
		'''make a post request to the qBot to send a message to a chat room'''
		if self.debug:
			chatroom = self.bot_test
		requests.post(f"{self.qBot_api}/meeting:{chatroom}", data=message, auth=HTTPBasicAuth(self.bot_name, self.bot_password))

	def get_branch_name(self, attuid, msrp, summary):
		'''get the branch name'''
		branch = summary.translate(self.trantab)
		branch = branch.replace(" - ",'-')
		branch = branch.replace(" ",'-')
		branch = branch.replace("--",'-')
		branch = branch.replace("---",'-')
		return f"{attuid}-{msrp}-{branch}"