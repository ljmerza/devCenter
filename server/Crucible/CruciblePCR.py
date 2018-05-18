#!/usr/bin/python3

import re
import math

class CruciblePCR():

	def __init__(self, crucible_api):
		''' creates a CruciblePCR instance

		Args:
			None
			
		Returns:
			a CruciblePCR instance
		'''
		
		self.crucible_api = crucible_api
		self.pcr_pass = "=#= PCR PASS =#="
		self.pcr_pass_regex = re.compile(r"=#= PCR PASS =#=")

		self.code_cloud_path = '/projects/ST_M5DTI/repos'
		self.code_cloud_path2 = 'compare/diff'

	def get_pcr_estimate(self, story_point):
		'''gets the PCR estimate off the story points of a Jira issue

		Args:
			story_point (str) the story points of the Jira issue
			
		Returns:
			the int value of the PCR estimate
		'''
		pcr_estimate = 1
		if(story_point > 1):
			pcr_estimate = int(math.ceil(story_point / 2))
		return pcr_estimate	

	def create_crucible_title(self, story_point, key, msrp, summary):
		'''creates the Crucible title format

		Args:
			story_point (str) the story points of the Jira issue
			key (str) the key of the Jira issue
			msrp (str) the MSRP of the Jira issue
			summary (str) the summary of the Jira issue
			
		Returns:
			the Crucible title string
		'''
		pcr_estimate = self.get_pcr_estimate(story_point=story_point)
		return f'(PCR-{pcr_estimate}) [{key}] Ticket #{msrp} {summary}'

	def add_reviewer(self, crucible_id, cred_hash, user):
		'''Adds a reviewer to a crucible
		'''
		url = f'{self.crucible_api.crucible_api_review}/{crucible_id}/reviewers'
		response = self.crucible_api.post(url=url, data=user, cred_hash=cred_hash)
		if not response['status']:
			return {'status': False, 'data': f'Could not add review users for {crucible_id}'}
		return response

	def delete_reviewer(self, crucible_id, cred_hash, user):
		'''Removes a reviewer from a crucible
		'''
		url = f'{self.crucible_api.crucible_api_review}/{crucible_id}/reviewers/{user}'
		response = self.crucible_api.delete(url=url, cred_hash=cred_hash)
		if not response['status']:
			return {'status': False, 'data': f'Could not remove review users for {crucible_id}'}
		return response

	def complete_review(self, crucible_id, cred_hash):
		'''sets a user's status on a Crucible review to 'complete'

		Args:
			crucible_id (str) the Crucible ID to user
			cred_hash (str) the user's basic auth hash
			
		Returns:
			response dict with status property
		'''
		return self.crucible_api.post(url=f'{self.crucible_api.crucible_api_review}/{crucible_id}/complete.json', cred_hash=cred_hash)

	def publish_review(self, crucible_id, cred_hash):
		'''
		'''
		url = f'{self.crucible_api.crucible_api_review}/{crucible_id}/transition?action=action:approveReview&ignoreWarnings=true.json'
		response = self.crucible_api.post_json(json_data={}, url=url, cred_hash=cred_hash)
		if not response['status']:
			return {'status': False, 'data': f'Could not publish review for {crucible_id}: '+response['data']}
		return response

	def create_crucible(self, data, cred_hash):
		json_data = {
			"reviewData": {
				"allowReviewersToJoin": "true",
				"author": {"userName":data['username']},
				"creator": {"userName":data['username']},
				"moderator": {"userName":data['username']},
				"description": '',
				"name": data['title'],
				"projectKey": "CR-UD",
				"description": self.generate_code_cloud_objectives(repos=data['repos'])
			}
		}
		
		response = self.crucible_api.post_json(url=f'{self.crucible_api.crucible_api_review}.json', json_data=json_data, cred_hash=cred_hash)
		
		if not response['status']:
			return {'data':  'Could not create crucible review: '+response['data'], 'status': False}
		if 'permaId' not in response['data']:
			return {'data': 'Could not get permId: '+response['data'], 'status': False}

		crucible_id = response['data']['permaId']['id']
		return {'data': crucible_id, 'status': True}

	def generate_code_cloud_objectives(self, repos):
		'''
		'''
		objective = ''

		for repo in repos:
			baseBranch = repo['baseBranch']
			repositoryName = repo['repositoryName']
			reviewedBranch = repo['reviewedBranch']

			branch_url = f'{self.crucible_api.code_cloud_api}{self.code_cloud_path}/{repositoryName}/{self.code_cloud_path2}?targetBranch=refs%2Fheads%2F{baseBranch}&sourceBranch=refs%2Fheads%2F{reviewedBranch}'
			objective = f'{objective}\n\n{repositoryName}: {branch_url}'

		return objective