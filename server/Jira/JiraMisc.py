#!/usr/bin/python3

import datetime
import math

from time import gmtime, strftime
from .JiraQa import *
from .JiraFields import *


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

	def set_dev_changes(self, dev_value, key, cred_hash):
		'''sets the dev changes value of a Jira ticket
		'''
		json_data = {"fields":{"customfield_10138":dev_value}}
		return self.jira_api.put_json(url=f'{self.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

	def add_pr_to_dev_changes(self, pull_response, data):
		'''
		'''
		dev_value = 'PULL REQUESTS:\n'
		for request in pull_response['data']:
			if request['status']:
				repo = request['data']['fromRef']['repository']['name']
				link = request['data']['links']['self'][0]['href']
				dev_value += f'{repo}: {link}\n'

		pcr_number = math.ceil(data['story_point']/2)
		dev_value += f'\nPCR needed: {pcr_number}'

		return self.add_dev_changes(dev_value=dev_value, cred_hash=cred_hash, key=key)
		
	def add_dev_changes(self, dev_value, cred_hash, key):
		'''add text to dev changes field
		'''
		return self.set_dev_changes(dev_value=dev_value, cred_hash=data['cred_hash'], key=data['key'])

	def build_qa_title(self, key, msrp, summary):
		return f"[{key}] Ticket #{msrp} - {summary}"

	def get_pcr_estimate(self, story_point):
		pcr_estimate = 1
		if(story_point > 1):
			pcr_estimate = int(math.ceil(story_point / 2))
		return pcr_estimate	

	
	


	

	
	
	
	


