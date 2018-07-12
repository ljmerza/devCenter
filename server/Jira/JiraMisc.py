#!/usr/bin/python3

import datetime
from time import gmtime, strftime
from JiraQa import *
from JiraFields import *


class JiraMisc():
	def __init__(self, jira_api):
		self.jira_api = jira_api

	def find_key_by_msrp(self, msrp, cred_hash):
		url = f'{self.jira_api.api_base}/search?jql=MSRP_Number~{msrp}&fields=key'
		response = self.jira_api.get(url=url, cred_hash=cred_hash)

		if not response['status']:
			return response
		elif len(response['data']['issues']):
			return {'status': True, 'data': response['data']['issues'][0]['key']}
		else:
			return {'status': False, 'data': f'Did not find any key matching {msrp}'}

	def find_crucible_title_data(self, msrp, cred_hash):
		# get ticket data based off MSRP and check for status
		url = f'{self.jira_api.api_base}/search?jql=MSRP_Number~{msrp}&fields=timeoriginalestimate,summary'
		search_response = self.jira_api.get(url=url, cred_hash=cred_hash)

		if not search_response['status']:
			return search_response

		if not search_response['data']['issues']:
			return {'status':False, 'data': 'Could not find MSRP from branch name'}

		# get first issue found
		issue = search_response['data']['issues'][0]

		return { 
			'status': True, 
			'data':{
				'summary': get_summary(issue),
				'key': get_key(issue),
				'story_point': get_story_point(issue)
			}
		}

	def add_work_log(self, time, key, cred_hash, private_log=True):
		json_data = {
			'comment': '', 
			'started': strftime("%Y-%m-%dT%H:%M:%S.000+0000", gmtime()), 
			'timeSpentSeconds': time,
			'notifyUsers': False
		}

		if private_log:
			json_data['visibility'] = {'type': 'role', 'value': 'Developers'}

		return self.jira_api.post_json(url=f'{self.jira_api.api_base}/issue/{key}/worklog', json_data={"timeSpent":time}, cred_hash=cred_hash)

	def generate_qa_template(self, qa_steps, repos, crucible_id, description):
		return generate_qa_template_string(qa_steps, repos, crucible_id, description)

	def get_profile(self, cred_hash):
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

	
	


	

	
	
	
	


