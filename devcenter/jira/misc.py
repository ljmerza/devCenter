"""Miscellaneous actions for Jira."""
import datetime
import math
from time import gmtime, strftime

from .fields import *
from devcenter.server_utils import generate_cred_hash


class JiraMisc():
	"""Miscellaneous actions for Jira."""

	@classmethod
	def build_qa_title(cls, key, msrp, summary):
		"""Build the title for a QA."""
		return f"[{key}] Ticket #{msrp} - {summary}"

	@classmethod
	def get_pcr_estimate(cls, story_point):
		"""Figure out the PCR estimate."""
		pcr_estimate = 1
		if(story_point > 1):
			pcr_estimate = int(math.ceil(story_point / 2))
		# max 2 always
		if pcr_estimate > 2:
			pcr_estimate = 2
		return pcr_estimate	

	def find_key_by_msrp(self, msrp='', cred_hash=''):
		cred_hash = generate_cred_hash()
		"""Find a ticket's key by MSRP number."""
		url = f'{self.jira_api.api_base}/search?jql=cf[10212]~{msrp}&fields=key'
		response = self.jira_api.get(url=url, cred_hash=cred_hash)

		if not response['status']:
			return response
		elif len(response['data']['issues']):
			return {'status': True, 'data': response['data']['issues'][0]['key']}
		else:
			return {'status': False, 'data': f'Did not find any key matching {msrp}'}

	def add_work_log(self, time, key, cred_hash, private_log=True):
		"""Add a work log for a ticket."""
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
		"""Get a Jira user's profile."""
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

	def set_dev_changes(self, dev_changes, key, cred_hash):
		"""Sets the dev changes field of a Jira ticket."""
		json_data = {"fields":{"customfield_10138":dev_changes}}
		response = self.jira_api.put_json(url=f'{self.jira_api.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)
		
		if response['status']:
			response['data'] = dev_changes
		return response
	
	def set_additional_qa(self, comment, key, cred_hash):
		"""Sets the QA Test additional Info field of a Jira ticket."""
		json_data = {"fields":{"customfield_10118":comment}}
		response = self.jira_api.put_json(url=f'{self.jira_api.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)
		
		if response['status']:
			response['data'] = comment
		return response

	def add_pr_to_dev_changes(self, pull_response, data):
		"""Add pull requests to dev changes field."""
		dev_changes = 'PULL REQUESTS:\n'
		for request in pull_response['data']:
			if request.get('link', False):
				repo = request['repo']
				link = request['link']
				dev_changes += f'{repo}: {link}\n'

		pcr_number = math.ceil(data['story_point']/2)
		dev_changes += f'\nPCR needed: {pcr_number}'

		return self.add_dev_changes(dev_changes=dev_changes, cred_hash=data['cred_hash'], key=data['key'])
		
	def add_dev_changes(self, dev_changes, cred_hash, key):
		"""Add text to dev changes field."""
		return self.set_dev_changes(dev_changes=dev_changes, cred_hash=cred_hash, key=key)

	def get_active_sprints(self, cred_hash=''):
		"""Get all currently active sprints."""
		cred_hash = generate_cred_hash()
		url = f'{self.jira_api.api_agile_base}/board/179/sprint'
		response = self.jira_api.get(url=url, cred_hash=cred_hash)
		if not response['status']:
			return response

		active_sprints = [sprint for sprint in response['data']['values'] 
						  if sprint['state'] == 'active']
		return {'status': True, 'data': active_sprints}