#!/usr/bin/python3

import API
import JiraFields
import re
import os
from time import gmtime, strftime

class JiraAPI(API.API):
	'''jira class using an attuid and password'''

	def __init__(self):
		super().__init__()
		##############################################################################
		self.base_url = os.environ['JIRA_URL'] # the base url to browse a single ticket
		self.api_base = f'{self.base_url}/rest/api/2'
		self.login_url = f'{self.base_url}/login.jsp' # the login page
		self.fields = 'comment,status,customfield_10212,summary, \
		assignee,components,customfield_10006,customfield_10001,customfield_10002,\
		labels,customfield_10102,customfield_10103,progress,assignee,reporter,issuetype, \
		project,customfield_10155,updated,fixVersionscustomfield_10108,priority,aggregateprogress, \
		timespent,aggregatetimespent,created,customfield_10109,duedate'
		##############################################################################
		self.attuid = os.environ['USER']
		self.password = os.environ['PASSWORD']
		##############################################################################
		self.payload = { # jira body payload
			"os_username": self.attuid,
			"os_password": self.password,
			"login": "Log+In",
			"os_destination" : "",
			"user_role": "",
			"atl_token": ""
		}
		##############################################################################
		self.total_tickets = 0
		

	def login(self, attuid='', password=''):
		# overwrite credentials if given
		if attuid and password:
			self.attuid = attuid
			self.password = password
		# try to login
		response = self.login_json(f'{self.base_url}/rest/auth/1/session', json={"username": self.attuid,"password": self.password})
		# check login response
		if response in [200,201]:
			return { "status": True }
		elif response == 401:
			return { "status": False, "message":"Invalid credentials"}
		elif response == 403: 
			return { "status": False, "message":"CAPTCHA required"}
		else:
			return { "status": False, "message":"Unknown error"}


	def reset_data(self):
		self.keys = []
		self.msrps = []
		self.statuses = []
		self.components = []
		self.summaries = []
		self.story_points = []
		self.attuids = []
		self.sprints = []
		self.epic_links = []
		self.labels = []
		self.qa_steps = []
		self.comments = []


	def get_filter_url(self, filter_number):
		response = self.get_endpoint_data(url=f'{self.base_url}/rest/api/2/filter/{filter_number}')
		if response['status']:
			response['data'] = response['data']['searchUrl']
			return response
		else: 
			return response



	def get_jira_tickets(self, filter_number, start_at=0, max_results=1000):

		# get filter url
		response = self.get_filter_url(filter_number)
		if not response['status']:
			return response

		# get raw url
		url = response['data']

		# get filter data
		response_jira = self.get_endpoint_data(url=f'{url}&startAt={start_at}&maxResults={max_results}&fields={self.fields}')
		if not response_jira['status']:
			return response_jira

		response['status'] = True
		response['data'] = response_jira['data']['issues']
		return response



	def get_raw_jira_data(self, filter_number, max_results=1000, start_at=0):

		# get jira tickets
		response_jira = self.get_jira_tickets(filter_number=filter_number, max_results=max_results, start_at=start_at)
		if not response_jira['status']:
			return response_jira
		issues = response_jira['data']['data']['issues']

		response = {
				"total_tickets": response_jira['data']['data']['total'],
				"data": []
		}

		# for each ticket get data
		for issue in issues:

			ticket = {}

			# get key
			ticket['key'] = JiraFields.get_key(issue)
			# get msrp
			ticket['msrp'] = JiraFields.get_msrp(issue)

			# get summary
			ticket['summary'] = JiraFields.get_summary(issue)
			# get attuid
			ticket['attuid'] = JiraFields.get_attuid(issue)

			# get component
			ticket['component'] = JiraFields.get_component(issue)
			# get status
			ticket['status'] = JiraFields.get_status(issue)

			# get story points
			ticket['story_points'] = JiraFields.get_story_points(issue)
			# get sprint
			ticket['sprint']  = JiraFields.get_sprint(issue)
			
			# get epic link
			ticket['epic_link'] = JiraFields.get_epic_link(issue)
			# get labels
			ticket['label'] = JiraFields.get_label(issue)

			# get comments and QA steps
			ticket['comments'] = JiraFields.get_comments(issue)
			ticket['qa_steps'] = JiraFields.get_qa_steps(issue)

			# add ticket to response
			response['data'].append(ticket)

		return response


	def get_jira_data(self, filter_number, startAt=0, max_results=1000):
		self.reset_data()

		# get filter url
		response = self.get_filter_url(filter_number)
		if not response['status']:
			return response

		# get raw url
		url = response['data']

		# get filter data
		response = self.get_endpoint_data(url=f'{url}&startAt={startAt}&maxResults={max_results}&fields={self.fields}')
		if not response['status']:
			return False

		# get total issues
		self.total_tickets = response['data']['total']
		# get all issue data
		issues = response['data']['issues']

		print(f'{self.total_tickets} tickets found')

		# for each issue add data to arrays
		for issue in issues:

			# get key
			self.keys.append( JiraFields.get_key(issue) )
			# get msrp
			self.msrps.append( JiraFields.get_msrp(issue) )

			
			# get summary
			self.summaries.append( JiraFields.get_summary(issue) )
			# get attuid
			self.attuids.append( JiraFields.get_attuid(issue) )

			# get component
			self.components.append( JiraFields.get_component(issue) )
			# get status
			self.statuses.append( JiraFields.get_status(issue) )

			# get story points
			self.story_points.append( JiraFields.get_story_points(issue) )
			# get sprint
			self.sprints.append( JiraFields.get_sprint(issue) )

			# get epic link
			self.epic_links.append( JiraFields.get_epic_link(issue) )
			# get labels
			self.labels.append( JiraFields.get_label(issue) )

			# get comments and QA steps
			self.comments.append( JiraFields.get_comments(issue) )
			self.qa_steps.append( JiraFields.get_qa_steps(issue) )
			

		# normalize ticket fields
		self._check_ticket_fields()


	def find_key_by_msrp(self, msrp):
		issue = self.get_endpoint_data(url=f'{self.api_base}/search?jql=MSRP_Number~{msrp}')
		if issue['status'] and len(issue['data']['issues']):
			return issue['data']['issues'][0]['key']
		else:
			return False

	def find_qa_data(self, msrp):
		issue = self.get_endpoint_data(url=f'{self.api_base}/search?jql=MSRP_Number~{msrp}')
		if issue and issue['status']:
			issue = issue['data']['issues'][0]
			data = {"status": True}
			if issue['fields']['customfield_10006']:
				data['story_point'] = issue['fields']['customfield_10006']
			if issue['key']:
				data['key'] = issue['key']
			if issue['fields']['summary']:
				data['summary'] = issue['fields']['summary']
			return data
		else:
			return issue

	def add_comment(self, key, comment, private_comment=True):
		'''adds a comment to a jira issue. By default the comment is
		set to developer view only

		Args:
			key (str) the jira issue key to update
			comment (str) the comment to post to the jira issue
			private_comment (boolean) is the comment developer only or public? (default true)

		Returns:
			dict: status boolean and/or data hash
		'''
		json_data = {"body": comment}
		if private_comment:
			json_data['visibility'] = {'type': 'role', 'value': 'Developers'}
		return self.json_post_endpoint_data(url=f'{self.api_base}/issue/{key}/comment', json_data=json_data)


	def _set_component(self, component_name, key, cred_hash=''):
		'''sets a jira issue to the given component

		Args:
			component_name (str) the component name to set the jira issue to
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		json_data = {
			"update":{
				"components":[{
					"set":[{
						"name":component_name
					}]
				}]
			}
		}
		return self.json_put_endpoint_data(url=f'{self.api_base}/issue/{key}', json_data=json_data, cred_hash=cred_hash)

	def _remove_component(self, component_name, key):
		'''removes a jira issue to the given component

		Args:
			component_name (str) the component name to remove the jira issue from
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self.json_put_endpoint_data(url=f'{self.api_base}/issue/{key}', json_data={"update":{"components":[{"remove":[{"name":component_name}]}]}})

	def _set_status(self, transition_id, key):
		'''sets a jira issue to the given status

		Args:
			transition_id (int) the status id to set the jira issue to
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self.json_post_endpoint_data(url=f'{self.api_base}/issue/{key}/transitions', json_data={"transition":{"id":transition_id}})


	def set_in_dev(self, key):
		'''sets a jira issue to the In Development status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=0)

	def set_pcr_needed(self, key):
		'''sets a jira issue to the PCR Needed component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='PCR - Needed')

	def set_pcr_complete(self, key, cred_hash=''):
		'''sets a jira issue to the PCR complete component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='PCR - Completed', cred_hash=cred_hash)

	def set_code_review(self, key):
		'''sets a jira issue to the Code Review status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=521)

	def set_code_review_working(self, key):
		'''sets a jira issue to the Code Review - Working component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='Code Review - Working')

	def set_ready_for_qa(self, key):
		'''sets a jira issue to the Ready For QA status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=71)

	def set_in_qa(self, key):
		'''sets a jira issue to the In QA status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=81)

	# def set_ready_uct(self, key):
	'''sets a jira issue to the Ready For UCT status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
	# 	return self._set_status(key=key, transition_id=0)

	def set_merge_code(self, key):
		'''sets a jira issue to the Merge Code component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='Merge Code')

	def set_merge_conflict(self, key):
		'''sets a jira issue to the Merge Conflict component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='Merge Conflict')

	# def set_in_uct(self, key):
	'''sets a jira issue to the In UCT status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
	# 	return self._set_status(key=key, transition_id=0)

	def set_uct_fail(self, key):
		'''sets a jira issue to the UCT Fail component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='UCT - Failed')

	def set_ready_release(self, key):
		'''sets a jira issue to the Ready For Release component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='Ready for Release')


	def add_work_log(self, time, key, private_log=True):
		'''add worklog time to a Jira issue

		Args:
			time (str): the time logged in '3d 3h 30m 20s' format
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''

		json_data = {
			'comment': '', 
			'started': strftime("%Y-%m-%dT%H:%M:%S.000+0000", gmtime()), 
			'timeSpentSeconds': time,
			'notifyUsers': False
		}

		if private_log:
			json_data['visibility'] = {'type': 'role', 'value': 'Developers'}


		return self.json_post_endpoint_data(url=f'{self.api_base}/issue/{key}/worklog', json_data={"timeSpent":time})
		
	


	

	
	
	
	


