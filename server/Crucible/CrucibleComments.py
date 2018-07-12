#!/usr/bin/python3
import re

class CrucibleComments():
	def __init__(self, crucible_api):
		self.crucible_api = crucible_api
		self.pcr_pass_regex = re.compile(r"=#= PCR PASS =#=")
		self.comment_path = 'comments.json?render=true'

	def add_comment(self, comment, crucible_id, cred_hash):
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

		url = f'{self.crucible_api.crucible_api_review}/{crucible_id}/{self.comment_path}'
		return self.crucible_api.post_json(url=url, json_data=json_data, cred_hash=cred_hash)

	def get_comments(self, crucible_id, cred_hash):
		url = f'{self.crucible_api.crucible_api_review}/{crucible_id}/{self.comment_path}'
		return self.crucible_api.get(url=url, cred_hash=cred_hash)

	def add_pcr_pass(self, crucible_id, cred_hash):
		return self.add_comment(comment=self.crucible_api.pcr_pass, crucible_id=crucible_id, cred_hash=cred_hash)
