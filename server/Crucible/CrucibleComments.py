#!/usr/bin/python3

class CrucibleComments():
	'''
	'''

	def __init__(self, crucible_api):
		'''

		Args:
			
			
		Returns:
			
		'''
		self.crucible_api = crucible_api

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

	def get_comments(self, crucible_id, cred_hash):
		'''gets all comments of a Crucible review

		Args:
			crucible_id (str) the Crucible ID to user
			cred_hash (str) the user's basic auth hash
			
		Returns:
			response dict with status property
		'''
		return self.crucible_api.get(url=f'{self.crucible_api.crucible_api_review}/{crucible_id}/comments.json?render=true', cred_hash=cred_hash)


	def add_pcr_pass(self, crucible_id, cred_hash):
		'''adds a comment of PCR pass to a Crucible review

		Args:
			crucible_id (str) the Crucible ID to user
			cred_hash (str) the user's basic auth hash
			
		Returns:
			response dict with status property
		'''
		return self.add_comment(comment=self.pcr_pass, crucible_id=crucible_id, cred_hash=cred_hash)

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