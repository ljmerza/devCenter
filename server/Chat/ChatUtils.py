#!/usr/bin/python3

import os
import re

td_style = "border: 1px solid #dddddd;padding: 8px;"
td_alt_style = "background-color: #dddddd;"
table_style = "border-collapse: collapse;"
trantab = "".maketrans(",!.;:/\\()@#$%^&*[]'<>|~`", "------------------------")

jira_url = os.environ['JIRA_URL']
jira_ticket_base = f'{jira_url}/browse'

crucible_url = os.environ['CRUCIBLE_URL']
crucible_ticket_base = f'{crucible_url}/cru'

def get_estimate_string(story_point):
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

def get_branch_name(username, msrp, summary):
	branch = summary.translate(trantab)
	branch = re.sub(r" +", '-', branch)
	branch = re.sub(r"\"", '', branch)
	branch = re.sub(r"\'", '', branch)
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

def build_commit_message(key, msrp, summary):
	return f"[{key}] Ticket #{msrp} {summary}"

def build_message(data, commit_message=False, jira_message=False, branch_message=False, crucible_message=False, sprint_message=False, msrp_message=False, summary_message=False, crucible_title_message=False, estimate_message=False):

	# keep track of odd table rows
	color_bg = 0

	# make message table and the type of message string
	type_message = data['type_message']

	message = f"{type_message}: <br> <table style='{table_style}'>"

	# add commit message
	if commit_message:
		# increment color_bg and see if this row needs bg coloring
		color_bg +=1
		if color_bg % 2 == 1:
			color = td_alt_style
		else:
			color = ''
		# build commit message
		commit_message = build_commit_message(data['key'], data['msrp'], data['summary'])
		# create message piece
		message += f"\
		<tr> \
			<td style='{td_style} {color}'>Commit Message</td> \
			<td style='{td_style} {color}'>{commit_message}</td> \
		</tr>" 

	# add Jira link
	if jira_message:
		# increment color_bg and see if this row needs bg coloring
		color_bg +=1
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

	# add crucible link
	if crucible_message:
		# increment color_bg and see if this row needs bg coloring
		color_bg +=1
		if color_bg % 2 == 1:
			color = td_alt_style
		else:
			color = ''
		# get data
		crucible_id = data['crucible_id']
		message += f"\
		<tr> \
			<td style='{td_style} {color}'>Crucible Link</td> \
			<td style='{td_style} {color}'><a href='{crucible_ticket_base}/{crucible_id}'>{crucible_ticket_base}/{crucible_id}</a></td> \
		</tr>"

	# add branch name
	if branch_message:
		# increment color_bg and see if this row needs bg coloring
		color_bg +=1
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
		color_bg +=1
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
		color_bg +=1
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
		color_bg +=1
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
		color_bg +=1
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
		color_bg +=1
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