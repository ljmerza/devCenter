"""Miscellaneous chat actions."""
import os

from devcenter.server_utils import get_branch_name


td_style = "border: 1px solid #dddddd;padding: 8px;"
td_alt_style = "background-color: #dddddd;"
table_style = "border-collapse: collapse;"


class ChatMisc():
	"""Miscellaneous chat actions."""

	@classmethod
	def get_estimate_string(cls, story_point):
		if(story_point):
			if(story_point < 1):
				story_point = str(int(8*story_point)) + ' hours'
			elif(story_point // 5 >= 1):

				week = story_point // 5
				days = story_point % 5
				story_point = str(int(week)) + ' week'
				if(days >= 1):
					story_point = story_point + ' ' + str(int(days))
					if days == 1:
						story_point += ' day'
					else:
						story_point += ' days'
			elif(story_point == 1):
				story_point = str(int(story_point)) + ' day'
			else:
				story_point = str(int(story_point)) + ' days'
		return story_point

	@classmethod
	def build_message(
		cls, data, commit_message=False, jira_message=False, 
		branch_message=False, sprint_message=False, msrp_message=False, 
		summary_message=False, crucible_title_message=False, estimate_message=False):
		"""Builds am essage for the Chat system."""
		# keep track of odd table rows
		color_bg = 0

		# make message table and the type of message string
		type_message = data['type_message']

		message = f"{type_message}: <br> <table style='{table_style}'>"

		# add commit message
		if commit_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg += 1
			if color_bg % 2 == 1:
				color = td_alt_style
			else:
				color = ''

			# build commit message
			commit_message = build_commit_message(
				key=data['key'],
				msrp=data['msrp'],
				summary=data['summary'],
				epic_link=data['epic_link']
			)
			
			# create message piece
			message += f"\
			<tr> \
				<td style='{td_style} {color}'>Commit Message</td> \
				<td style='{td_style} {color}'>{commit_message}</td> \
			</tr>"

		# add Jira link
		if jira_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg += 1
			if color_bg % 2 == 1:
				color = td_alt_style
			else:
				color = ''
			# get data
			key = data['key']
			message += f"\
			<tr> \
				<td style='{td_style} {color}'>Jira Link</td> \
				<td style='{td_style} {color}'><a href='{jira_ticket_base}/{key}'>{jira_ticket_base}/{key}</a></td> \
			</tr>"

		# add branch name
		if branch_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg += 1
			if color_bg % 2 == 1:
				color = td_alt_style
			else:
				color = ''
			# get data
			branch = data['branch']
			message += f"\
			<tr> \
				<td style='{td_style} {color}'>Branch</td> \
				<td style='{td_style} {color}'>{branch}</td> \
			</tr>"

		# add sprint
		if sprint_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg += 1
			if color_bg % 2 == 1:
				color = td_alt_style
			else:
				color = ''
			# get data
			sprint = data['sprint']
			message += f"\
			<tr> \
				<td style='{td_style} {color}'>Sprint</td> \
				<td style='{td_style} {color}'>{sprint}</td> \
			</tr>"

		# add MSRP number
		if msrp_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg += 1
			if color_bg % 2 == 1:
				color = td_alt_style
			else:
				color = ''
			# get data
			msrp = data['msrp']
			message += f"\
			<tr> \
				<td style='{td_style} {color}'>MSRP</td> \
				<td style='{td_style} {color}'>{msrp}</td> \
			</tr>"

		# add summary
		if summary_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg += 1
			if color_bg % 2 == 1:
				color = td_alt_style
			else:
				color = ''
			# get data
			summary = data['summary']
			message += f"\
			<tr> \
				<td style='{td_style} {color}'>Summary</td> \
				<td style='{td_style} {color}'>{summary}</td> \
			</tr>"

		# add estimate
		if estimate_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg += 1
			if color_bg % 2 == 1:
				color = td_alt_style
			else:
				color = ''
			# get data
			estimate = data['estimate']
			message += f"\
			<tr> \
				<td style='{td_style} {color}'>Estimate</td> \
				<td style='{td_style} {color}'>{estimate}</td> \
			</tr>"

		# add crucible title format
		if crucible_title_message:
			# increment color_bg and see if this row needs bg coloring
			color_bg += 1
			if color_bg % 2 == 1:
				color = td_alt_style
			else:
				color = ''
			# get data
			pcr_estimate = data['pcr_estimate']
			key = data['key']
			msrp = data['msrp']
			summary = data['summary']
			message += f"\
			<tr> \
				<td style='{td_style} {color}'>Crucible Title</td> \
				<td style='{td_style} {color}'>(PCR-{pcr_estimate}) [{key}] Ticket #{msrp} {summary}</td>\
			</tr>"

		# close table and return message string
		message += "</table>"
		return message

	def send_new_ticket(self, key, msrp, summary, username, story_point, pcr_estimate, epic_link):
		"""Send a new Jira ticket to a user."""
		branch = get_branch_name(username=username, msrp=msrp, summary=summary)
		estimate = self.get_estimate_string(story_point=story_point)

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

		message = self.build_message(
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

		message = self.build_message(
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
		self.chat_api.send_meeting_message(message=message, chatroom=chatroom)

	def beta_statistics(self, uct, pcr, qa, cr, beta):
		"""Send current beta week statistics to a chatroom."""
		message = f"<br> \
			Beta Statistics: <br> \
				<table style='{table_style}'> \
					<tr> \
						<td style='{td_style}'>UAT Ready</td> \
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
		if ping_message in ['Merge Conflict','Code Review - Failed','UAT - Failed','UAT - Failed','QA - Failed']:
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

		message = self.build_message(data=data, jira_message=True, branch_message=True)

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