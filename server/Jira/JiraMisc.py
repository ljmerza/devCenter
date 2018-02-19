#!/usr/bin/python3

import datetime
from time import gmtime, strftime
from JiraUtils import *
from JiraFields import *


class JiraMisc():
	'''Creates a JiraMisc class instance
	'''

	def __init__(self, jira_api):
		'''Create JiraMisc class instance

		Args:
			jira_api - a Jira API instance

		Returns:
			a JiraMisc instance
		'''
		self.jira_api = jira_api

	def find_key_by_msrp(self, msrp, cred_hash):
		'''find the key of a Jira ticket by it's MSRP value

		Args:
			msrp (str) the MSRP of the Jira ticket
			cred_hash (str) Authorization header value

		Returns:
			dict of status/data properties with the error message or Jira ticket key
		'''
		response = self.jira_api.get(url=f'{self.jira_api.api_base}/search?jql=MSRP_Number~{msrp}', cred_hash=cred_hash)
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
		search_response = self.jira_api.get(
			url=f'{self.jira_api.api_base}/search?jql=MSRP_Number~{msrp}&fields=timeoriginalestimate,summary', 
			cred_hash=cred_hash
			)

		if not search_response['status']:
			return search_response

		if not search_response['data']['issues']:
			return {'status':False, 'data': 'Could not find MSRP from branch name'}

		# get first issue found
		issue = search_response['data']['issues'][0]

		# return data
		return { 'status': True, 'data':{
			'summary': get_summary(issue),
			'key': get_key(issue),
			'story_point': get_story_point(issue)
		}}

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
		return self.jira_api.post_json(url=f'{self.jira_api.api_base}/issue/{key}/worklog', json_data={"timeSpent":time}, cred_hash=cred_hash)

	def generate_qa_template(self, qa_steps, repos, crucible_id):
		return generate_qa_template(qa_steps, repos, crucible_id)

	def get_profile(self, cred_hash):
		'''
		'''
		response = self.jira_api.get(url=f'{self.jira_api.api_base}/myself', cred_hash=cred_hash)
		if not response['status']:
			return response
		else:
			response['data']['avatar'] = response['data']['avatarUrls']['24x24']
			del response['data']['applicationRoles']
			del response['data']['avatarUrls']
			del response['data']['active']
			del response['data']['groups']
			del response['data']['locale']
			del response['data']['expand']
			return response

	
	


	

	
	
	
	


