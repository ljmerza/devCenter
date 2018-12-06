#!/usr/bin/python3

import os
from .JiraFields import get_key, get_msrp, get_user_details, get_customer_details, get_dates, get_summary, get_component, get_status, get_story_point, get_sprint, get_master_branch, get_epic_link, get_label, get_comments, get_attachments, get_watchers, get_priority, get_severity, get_code_reviewer, get_issue_type, get_environment, get_issue_links, get_description, get_history, get_dev_changes, get_worklog, get_username, get_display_name

class JiraTickets():
	def __init__(self, jira_api):
		self.jira_api = jira_api


	def get_filter_url(self, filter_number, cred_hash):
		response = self.jira_api.get(url=f'{self.jira_api.api_base}/filter/{filter_number}', cred_hash=cred_hash)
		if not response['status']:
			return response

		return {'status': True, 'data': response['data']['searchUrl'] }

	def get_raw_jira_tickets(self, cred_hash, fields='', jql='', filter_number='', get_expanded=True):
		if not jql and not filter_number:
			return {'status': False, 'data': 'Please provide a filter number or URL to get Jira tickets.'}

		if not jql:
			response = self.get_filter_url(filter_number=filter_number, cred_hash=cred_hash)
			if not response['status']:
				return response

			url = response['data']
		else:
			url = f'{self.jira_api.jira_search_url}?jql={jql}'

		if not fields:
			fields = self.jira_api.fields

		full_url = f'{url}&startAt=0&maxResults=1000&fields={fields}'
		if get_expanded:
			full_url += '&expand=names,renderedFields,changelog'

		response = self.jira_api.get(url=full_url, cred_hash=cred_hash)
		if not response['status']:
			return response

		return {'status': True, 'data': response['data']['issues']}

	def get_full_ticket(self, key, cred_hash):
		return self.get_jira_tickets(cred_hash=cred_hash, jql=f"key%3D%27{key}%27", fields=self.jira_api.fields)

	def get_ticket_field_values(self, key, cred_hash, fields, get_expanded=True):
		'''gets a list of ticket values for a single ticket
		'''
		response = self.get_jira_tickets(cred_hash=cred_hash, jql=f"key%3D%27{key}%27", fields=fields, get_expanded=get_expanded)
		
		if(not response['status']):
			return response
		elif(len(response['data']) == 0):
			return {'status': False, 'data': f'Could not find matching ticket for {key}'}
		elif(len(response['data']) > 1):
			return {'status': False, 'data': f'Found more than one match for {key}'}
		
		response['data'] = response['data'][0]
		return response

	def get_ticket_dev_changes(self, key, cred_hash):
		return self.get_jira_tickets(cred_hash=cred_hash, jql=f"key%3D%27{key}%27", fields='customfield_10138')

	def get_ticket_fields(self, issue, fields):
		ticket = {}

		ticket['key'] = get_key(issue)
		ticket['msrp'] = get_msrp(issue)

		ticket['user_details'] = get_user_details(issue)
		ticket['username'] = get_username(issue)
		ticket['display_name'] = get_display_name(issue)

		ticket['customer_details'] = get_customer_details(issue)
		ticket['dates'] = get_dates(issue)
		ticket['worklog'] = get_worklog(issue)

		ticket['summary'] = get_summary(issue)
		ticket['component'] = get_component(issue)
		ticket['status'] = get_status(issue)
		ticket['story_point'] = get_story_point(issue)

		ticket['sprint'] = get_sprint(issue)
		if ticket['sprint']:
			ticket['master_branch'] = get_master_branch(ticket['sprint'], ticket['key'])

		ticket['epic_link'] = get_epic_link(issue)
		ticket['label'] = get_label(issue)

		ticket['comments'] = get_comments(issue)
		ticket['attachments'] = get_attachments(issue)

		ticket['watchers'] = get_watchers(issue)
		ticket['priority'] = get_priority(issue)
		ticket['severity'] = get_severity(issue)

		ticket['code_reviewer'] = get_code_reviewer(issue)

		ticket['issue_type'] = get_issue_type(issue)
		ticket['environment'] = get_environment(issue)
		ticket['links'] = get_issue_links(issue)

		ticket['description'] = get_description(issue)
		ticket['history'] = get_history(issue)
		ticket['dev_changes'] = get_dev_changes(issue)

		return ticket

	def get_jira_tickets(self, cred_hash, fields='', jql='', filter_number='', get_expanded=True):
		if not fields or fields is None:
			fields = self.jira_api.fields

		response = self.get_raw_jira_tickets(filter_number=filter_number, cred_hash=cred_hash, fields=fields, jql=jql, get_expanded=get_expanded)
		if not response['status']:
			return response

		issues = response['data']
		response = {
				"total_tickets": len(issues),
				"data": [],
				'status': True
		}

		for issue in issues:
			ticket = self.get_ticket_fields(issue, fields)
			response['data'].append(ticket)

		return response
