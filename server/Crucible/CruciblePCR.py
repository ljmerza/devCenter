#!/usr/bin/python3
import sys
sys.path.append('..')

import re
import math

from Common import DevCenterAPI

class CruciblePCR(DevCenterAPI.DevCenterAPI):
	def __init__(self):
		DevCenterAPI.DevCenterAPI.__init__(self)
		self.pcr_pass = "=#= PCR PASS =#="
		self.pcr_pass_regex = re.compile(r"=#= PCR PASS =#=")

	def get_pcr_estimate(self, story_point):
		'''calculate the pcr number from the story points'''
		pcr_estimate = 1
		if(story_point > 1):
			pcr_estimate = int(math.ceil(story_point / 2))
		return pcr_estimate	

	def add_reviewer(self, attuid, crucible_id, cred_hash=''):
			return self.post_endpoint_data(url=f'{self.base_url}/rest-service/reviews-v1/{crucible_id}/reviewers.json', data=attuid, cred_hash=cred_hash)


	def add_comment(self, comment, crucible_id, cred_hash=''):
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
		return self.json_post_endpoint_data(url=f'{self.base_url}/rest-service/reviews-v1/{crucible_id}/comments.json', json_data=json_data, cred_hash=cred_hash)

	def add_pcr_pass(self, crucible_id, cred_hash=''):
		return self.add_comment(comment=self.pcr_pass, crucible_id=crucible_id, cred_hash=cred_hash)

	def get_comments(self, crucible_id, cred_hash=''):
		return self.get_endpoint_data(url=f'{self.base_url}/rest-service/reviews-v1/{crucible_id}/comments.json', cred_hash=cred_hash)

	def get_pcr_pass(self, crucible_id, cred_hash=''):
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

	def complete_review(self, crucible_id, cred_hash=''):
		return self.post_endpoint_data(url=f'{self.base_url}/rest-service/reviews-v1/{crucible_id}/complete.json', cred_hash=cred_hash)


