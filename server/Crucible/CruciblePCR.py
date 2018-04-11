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

	def add_reviewer(self, username, crucible_id, cred_hash):
		'''adds a user to a Crucible review

		Args:
			username (str) the username of the user to process
			crucible_id (str) the Crucible ID to user
			cred_hash (str) the user's basic auth hash
			
		Returns:
			response dict with status property
		'''
		return self.crucible_api.post(url=f'{self.crucible_api.crucible_api_review}/{crucible_id}/reviewers.json', data=username, cred_hash=cred_hash)

	def add_comment(self, comment, crucible_id, cred_hash):
		'''adds a comment to a Crucible review

		Args:
			comment (str) the comment to add
			crucible_id (str) the Crucible ID to user
			cred_hash (str) the user's basic auth hash
			
		Returns:
			response dict with status property
		'''
		json_data = {
			"message" : comment,
			"draft" : False,
			"deleted" : False,
			"defectRaised" : False,
			"defectApproved" : False,
			"permaId" : { },
			"permId" : { },
			"parentCommentId" : { }
		}
		return self.crucible_api.post_json(url=f'{self.crucible_api.crucible_api_review}/{crucible_id}/comments.json?render=true', json_data=json_data, cred_hash=cred_hash)

	def add_pcr_pass(self, crucible_id, cred_hash):
		'''adds a comment of PCR pass to a Crucible review

		Args:
			crucible_id (str) the Crucible ID to user
			cred_hash (str) the user's basic auth hash
			
		Returns:
			response dict with status property
		'''
		return self.add_comment(comment=self.pcr_pass, crucible_id=crucible_id, cred_hash=cred_hash)

	def get_comments(self, crucible_id, cred_hash):
		'''gets all comments of a Crucible review

		Args:
			crucible_id (str) the Crucible ID to user
			cred_hash (str) the user's basic auth hash
			
		Returns:
			response dict with status property
		'''
		return self.crucible_api.get(url=f'{self.crucible_api.crucible_api_review}/{crucible_id}/comments.json?render=true', cred_hash=cred_hash)

	def get_pcr_pass(self, crucible_id, cred_hash):
		'''gets all comment of a Crucible review and see how many are PCR pass

		Args:
			crucible_id (str) the Crucible ID to user
			cred_hash (str) the user's basic auth hash
			
		Returns:
			response dict with status property
		'''
		# get comments
		comments = self.get_comments(crucible_id=crucible_id, cred_hash=cred_hash)
		pcr_passes = 0
		# get comments if okay
		if comments['status']:
			comments = comments['data']['comments']
			# for each comment see if PCR pass
			for comment in comments:
				# if we have a PCR pass then increment number of PCR passes
				if re.match(self.pcr_pass_regex, comment['message']):
					pcr_passes += 1
		return pcr_passes

	def complete_review(self, crucible_id, cred_hash):
		'''sets a user's status on a Crucible review to 'complete'

		Args:
			crucible_id (str) the Crucible ID to user
			cred_hash (str) the user's basic auth hash
			
		Returns:
			response dict with status property
		'''
		return self.crucible_api.post(url=f'{self.crucible_api.crucible_api_review}/{crucible_id}/complete.json', cred_hash=cred_hash)


