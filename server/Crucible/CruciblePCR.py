#!/usr/bin/python3

import re
import math

class CruciblePCR():

	def __init__(self, crucible_api):	
		self.crucible_api = crucible_api
		self.code_cloud_path = '/projects/ST_M5DTI/repos'
		self.code_cloud_path2 = 'compare/diff'

	def get_pcr_estimate(self, story_point):
		pcr_estimate = 1
		if(story_point > 1):
			pcr_estimate = int(math.ceil(story_point / 2))
		return pcr_estimate	

	def create_crucible_title(self, story_point, key, msrp, summary):
		pcr_estimate = self.get_pcr_estimate(story_point=story_point)
		return f'(PCR-{pcr_estimate}) [{key}] Ticket #{msrp} {summary}'

	def add_reviewer(self, crucible_id, cred_hash, user):
		url = f'{self.crucible_api.crucible_api_review}/{crucible_id}/reviewers'
		response = self.crucible_api.post(url=url, data=user, cred_hash=cred_hash)

		if not response['status']:
			return {'status': False, 'data': f'Could not add review users for {crucible_id}'}
		return response

	def delete_reviewer(self, crucible_id, cred_hash, user):
		url = f'{self.crucible_api.crucible_api_review}/{crucible_id}/reviewers/{user}'
		response = self.crucible_api.delete(url=url, cred_hash=cred_hash)

		if not response['status']:
			return {'status': False, 'data': f'Could not remove review users for {crucible_id}'}
		return response

	def complete_review(self, crucible_id, cred_hash):
		return self.crucible_api.post(url=f'{self.crucible_api.crucible_api_review}/{crucible_id}/complete.json', cred_hash=cred_hash)

	def publish_review(self, crucible_id, cred_hash):
		url = f'{self.crucible_api.crucible_api_review}/{crucible_id}/transition?action=action:approveReview&ignoreWarnings=true.json'
		response = self.crucible_api.post_json(json_data={}, url=url, cred_hash=cred_hash)
		if not response['status']:
			return {'status': False, 'data': f'Could not publish review for {crucible_id}: '+response['data']}
		return response

	def create_crucible(self, data, cred_hash, pull_response):
		description = self.generate_code_cloud_objectives(repos=data['repos'], pull_response=pull_response)

		json_data = {
			"reviewData": {
				"allowReviewersToJoin": "true",
				"author": {"userName":data['username']},
				"creator": {"userName":data['username']},
				"moderator": {"userName":data['username']},
				"description": '',
				"name": data['title'],
				"projectKey": "CR-UD",
				"description": description
			}
		}
		
		response = self.crucible_api.post_json(url=f'{self.crucible_api.crucible_api_review}.json', json_data=json_data, cred_hash=cred_hash)
		
		if not response['status']:
			return {'data':  'Could not create crucible review: '+response['data'], 'status': False}
		if 'permaId' not in response['data']:
			return {'data': 'Could not get permId: '+response['data'], 'status': False}

		crucible_id = response['data']['permaId']['id']
		return {'data': crucible_id, 'status': True, 'description': description}

	def generate_code_cloud_objectives(self, repos, pull_response):
		objective = ''

		for repo in repos:
			baseBranch = repo['baseBranch']
			repositoryName = repo['repositoryName']
			reviewedBranch = repo['reviewedBranch']

			pull_request_link = self.get_pull_request_link(pull_response=pull_response, repositoryName=repositoryName)

			# get link to code cloud link
			branch_url = f'{self.crucible_api.code_cloud_api}{self.code_cloud_path}/{repositoryName}/{self.code_cloud_path2}?targetBranch=refs%2Fheads%2F{baseBranch}&sourceBranch=refs%2Fheads%2F{reviewedBranch}'
			objective = objective+'\nh1. {color:red}'+repositoryName+'{color}: [Code Cloud|'+branch_url+']'

			# add pull request link if found
			if pull_request_link:
				objective += ' [Pull Request|'+pull_request_link+'/diff]'

		return objective

	def get_pull_request_link(self, pull_response, repositoryName):
		pull_request_link = ''

		if pull_response.get('status', False):
			for request in pull_response.get('data'):

				if request.get('status', False):
					repo_name = request.get('data').get('toRef').get('repository').get('name')

					if repo_name.lower() == repositoryName.lower():
						pull_request_link = request.get('data').get(
							'links').get('self')[0].get('href')

		return pull_request_link
