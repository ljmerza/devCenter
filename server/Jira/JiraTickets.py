#!/usr/bin/python3

import os
from JiraFields import *

class JiraTickets():
	'''Jira class for getting/processing Jira tickets'''

	def __init__(self, jira_api):
		'''Creates a JiraTickets class instance

		Args:
			jira_api - a Jira API instance

		Returns:
			a JiraTickets instance
		'''
		self.jira_api = jira_api


	def get_filter_url(self, filter_number, cred_hash):
		'''gets the URL of a particular Jira filter

		Args:
			filter_number (str) the filter number to get Jira tickets from
			cred_hash (str) Authorization header value

		Returns:
			dict with status and data property
		'''
		response = self.jira_api.get(url=f'{self.jira_api.api_base}/filter/{filter_number}', cred_hash=cred_hash)
		if not response['status']:
			return response
		return {'status': True, 'data': response['data']['searchUrl'] }

	def get_raw_jira_tickets(self, cred_hash, start_at=0, max_results=1000, fields='', jql='', filter_number=''):
		'''returns the raw data from the Jira API of all Jira tickets from a filter number

		Args:
			cred_hash (str) Authorization header value
			start_at (int) optional what ticket to start at when getting the list of tickets (default 0)
			max_results (int) optional maximum number of tickets to retrieve (default 1000)
			fields (str) optional comma delimited list of fields to get from the Jira tickets
			jql (str) optional JQL to get the tickets from (will retrieve from filter_number if not given)
			filter_number (str) optional filter number to get Jira tickets from (need URL if not given)

		Returns:
			dict of status and data property with an array of Jira ticket objects
		'''
		# make sure we have a way to get Jira tickets
		if not jql and not filter_number:
			return {'status': False, 'data': 'Please provide a filter number or URL to get Jira tickets.'}

		# get filter url if URL not given
		if not jql:
			response = self.get_filter_url(filter_number=filter_number, cred_hash=cred_hash)
			if not response['status']:
				return response
			# get raw url
			url = response['data']
		else:
			url = f'{self.jira_api.jira_search_url}?jql={jql}'
		# if fields not passed use default

		if not fields:
			fields = self.jira_api.fields
		# get filter data
		full_url = f'{url}&startAt={start_at}&maxResults={max_results}&fields={fields}&expand=names,renderedFields'
		response = self.jira_api.get(url=full_url, cred_hash=cred_hash)
		if not response['status']:
			return response
		return {'status': True, 'data': response['data']['issues']}


	def get_full_ticket(self, key, cred_hash):
		return self.get_jira_tickets(cred_hash=cred_hash, jql=f"key%3D%27{key}%27", fields=self.jira_api.fields)

	def get_ticket_fields(self, issue, fields):
		'''
		'''
		ticket = {}

		ticket['key'] = get_key(issue)
		ticket['msrp'] = get_msrp(issue)

		ticket['user_details'] = get_user_details(issue)
		ticket['username'] = ticket['user_details']['username']
		ticket['customer_details'] = get_customer_details(issue)
		ticket['dates'] = get_dates(issue)

		ticket['crucible_id'] = get_crucible_id(issue)

		ticket['summary'] = get_summary(issue)
		ticket['component'] = get_component(issue)
		ticket['status'] = get_status(issue)
		ticket['story_point'] = get_story_point(issue)

		ticket['sprint']  = get_sprint(issue)
		ticket['epic_link'] = get_epic_link(issue)
		ticket['label'] = get_label(issue)

		ticket['comments'] = get_comments(issue)
		ticket['qa_steps'] = get_qa_steps(issue)

		ticket['attachments'] = get_attachments(issue)

		ticket['watchers'] = get_watchers(issue)
		ticket['priority'] = get_priority(issue)
		ticket['severity'] = get_severity(issue)

		ticket['code_reviewer'] = get_code_reviewer(issue)

		ticket['issue_type'] = get_issue_type(issue)
		ticket['environment'] = get_environment(issue)
		ticket['links'] = get_issue_links(issue)

		return ticket

	def get_jira_tickets(self, cred_hash, max_results=1000, start_at=0, fields='', jql='', filter_number=''):
		'''returns the formatted data from the Jira API of all Jira tickets from a filter number

		Args:
			cred_hash (str) Authorization header value
			start_at (int) optional what ticket to start at when getting the list of tickets (default 0)
			max_results (int) optional maximum number of tickets to retrieve (default 1000)
			fields (string) optional comma delimited list of fields to get from the Jira tickets
			jql (str) optional JQL to get the tickets from (will retrieve from filter_number if not given)
			filter_number (str) optional filter number to get Jira tickets from (need URL if not given)

		Returns:
			dict of status and data property with an array of formatted Jira ticket objects as well
			as the totla number of ticket found in total_tickets
		'''

		if not fields or fields is None:
			fields = self.jira_api.fields

		# get jira tickets and check response
		response = self.get_raw_jira_tickets(filter_number=filter_number, max_results=max_results, start_at=start_at, cred_hash=cred_hash, fields=fields, jql=jql)
		if not response['status']:
			return response

		# get all issues
		issues = response['data']

		# create response
		response = {
				"total_tickets": len(issues),
				"data": [],
				'status': True
		}

		# for each ticket get data
		for issue in issues:
			ticket = self.get_ticket_fields(issue, fields)

			# add ticket to response
			response['data'].append(ticket)
		return response