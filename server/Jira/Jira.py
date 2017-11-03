#!/usr/bin/python3

from JiraStatusComponent import JiraStatusComponent
import JiraFields
import JiraUtils

from time import gmtime, strftime

class Jira(JiraStatusComponent):
	'''Jira class for getting data from the Jira API'''

	def __init__(self):
		'''Create Jira class instance

		Args:
			None

		Returns:
			a Jira instance
		'''
		JiraStatusComponent.__init__(self)
		self.fields = 'customfield_10109,comment,status,customfield_10212,summary,assignee,components,customfield_10006,customfield_10001,customfield_10002,label,fixVersions,duedate,created,updated,customfield_10108,customfield_10102,customfield_10175,customfield_10103,customfield_10602,timetracking,labels'
		self.jira_search_url = f'{self.jira_url}/rest/api/2/search'

	def get_filter_url(self, filter_number, cred_hash):
		'''gets the URL of a particular Jira filter

		Args:
			filter_number (str) the filter number to get Jira tickets from
			cred_hash (str) Authorization header value

		Returns:
			dict with status and data property
		'''
		response = self.get(url=f'{self.api_base}/filter/{filter_number}', cred_hash=cred_hash)
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
			url = f'{self.jira_search_url}?jql={jql}'
		# if fields not passed use default

		if not fields:
			fields = self.fields
		# get filter data
		response = self.get(url=f'{url}&startAt={start_at}&maxResults={max_results}&fields={fields}', cred_hash=cred_hash)
		if not response['status']:
			return response
		return {'status': True, 'data': response['data']['issues']}

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

			ticket = {}

			# get key
			ticket['key'] = JiraFields.get_key(issue)
			# get msrp
			ticket['msrp'] = JiraFields.get_msrp(issue)

			# get summary
			ticket['summary'] = JiraFields.get_summary(issue)
			# get username
			ticket['username'] = JiraFields.get_username(issue)

			# get component
			ticket['component'] = JiraFields.get_component(issue)
			# get status
			ticket['status'] = JiraFields.get_status(issue)

			# get story points
			ticket['story_point'] = JiraFields.get_story_point(issue)
			# get sprint
			ticket['sprint']  = JiraFields.get_sprint(issue)
			
			# get epic link
			ticket['epic_link'] = JiraFields.get_epic_link(issue)
			# get label
			ticket['label'] = JiraFields.get_label(issue)

			# get comments and QA steps
			ticket['comments'] = JiraFields.get_comments(issue)
			ticket['qa_steps'] = JiraFields.get_qa_steps(issue)

			ticket['customer_details'] = JiraFields.get_customer_details(issue)
			ticket['severity'] = JiraFields.get_severity(issue)
			ticket['dates'] = JiraFields.get_dates(issue)

			ticket['crucible_id'] = JiraFields.get_crucible_id(issue)

			# add ticket to response
			response['data'].append(ticket)
		return response


	def find_key_by_msrp(self, msrp, cred_hash):
		'''find the key of a Jira ticket by it's MSRP value

		Args:
			msrp (str) the MSRP of the Jira ticket
			cred_hash (str) Authorization header value

		Returns:
			dict of status/data properties with the error message or Jira ticket key
		'''
		response = self.get(url=f'{self.api_base}/search?jql=MSRP_Number~{msrp}', cred_hash=cred_hash)
		if not response['status']:
			return response
		if len(response['data']['issues']):
			return {'status': True, 'data': response['data']['issues'][0]['key']}
		else:
			return {'status': False, 'data': f'Did not find any key matching {msrp}'}

	def find_crucible_title_data(self, msrp, cred_hash):
		'''finds the data needed from Jira to create a Crucible review title

		Args:
			msrp (str) the MSRP of the Jira ticket
			cred_hash (str) Authorization header value

		Returns:
			dict of status/data properties with the error message or a dict with keys: summary', 'key', 'story_point'
		'''
		# get ticket data based off MSRP and check for status
		search_response = self.get(url=f'{self.api_base}/search?jql=MSRP_Number~{msrp}', cred_hash=cred_hash)
		if not search_response['status']:
			return search_response
		# get issue found
		search_response = search_response['data']['issues'][0]

		# check story points
		if 'customfield_10006' not in search_response['fields']:
			return {'status': False, 'data': 'Missing story point'}
		# check key
		if not search_response['key']:
			return {'status': False, 'data': 'Missing key'}
		# check summary
		if 'summary' not in search_response['fields']:
			return {'status': False, 'data': 'Missing summary'}

		# return data
		return { 'status': True, 'data':{
			'summary': search_response['fields']['summary'],
			'key': search_response['key'],
			'story_point': search_response['fields']['customfield_10006']
		}}

	def add_comment(self, key, comment, cred_hash, private_comment=True):
		'''adds a comment to a jira issue. By default the comment is
		set to developer view only

		Args:
			key (str) the jira issue key to update
			comment (str) the comment to post to the jira issue
			cred_hash (str) Authorization header value
			private_comment (boolean) is the comment developer only or public? (default true)

		Returns:
			dict: status boolean and/or data hash
		'''
		json_data = {"body": comment}
		if private_comment:
			json_data['visibility'] = {'type': 'role', 'value': 'Developers'}
		return self.post_json(url=f'{self.api_base}/issue/{key}/comment', json_data=json_data, cred_hash=cred_hash)

	def add_work_log(self, time, key, cred_hash, private_log=True):
		'''add worklog time to a Jira issue

		Args:
			time (str): the time logged in '3d 3h 30m 20s' format
			cred_hash (str) Authorization header value
			key (str) the jira issue key to update
			private_log (boolean) optional if the work log is private or not (default True)

		Returns:
			dict: status boolean and/or data hash
		'''
		# create object to send to API
		json_data = {
			'comment': '', 
			'started': strftime("%Y-%m-%dT%H:%M:%S.000+0000", gmtime()), 
			'timeSpentSeconds': time,
			'notifyUsers': False
		}

		if private_log:
			json_data['visibility'] = {'type': 'role', 'value': 'Developers'}
		# POST work log and return data
		return self.post_json(url=f'{self.api_base}/issue/{key}/worklog', json_data={"timeSpent":time}, cred_hash=cred_hash)

	def generate_qa_template(self, qa_steps, repos, crucible_id):
		return JiraUtils.generate_qa_template(qa_steps, repos, crucible_id)
		
	


	

	
	
	
	


