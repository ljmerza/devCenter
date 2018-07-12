#!/usr/bin/python3

from .CruciblePCR import CruciblePCR
from .CrucibleRepoBranch import CrucibleRepoBranch
from .CrucibleReviewId import CrucibleReviewId
from .CrucibleComments import CrucibleComments
from .CrucibleAPI import CrucibleAPI

class Crucible(CruciblePCR, CrucibleRepoBranch, CrucibleReviewId, CrucibleComments):

	def __init__(self):
		self.crucible_api = CrucibleAPI()
		self.temp_user = 'sk213d'

		CruciblePCR.__init__(self, self.crucible_api)
		CrucibleRepoBranch.__init__(self, self.crucible_api)
		CrucibleReviewId.__init__(self, self.crucible_api)
		CrucibleComments.__init__(self, self.crucible_api)

	def generate_crucible(self, data, cred_hash, pull_response):
		response = self.create_crucible(
			data=data, cred_hash=cred_hash, pull_response=pull_response)
		if not response['status']:
			return response
		crucible_id = response.get('data')
		description = response.get('description')

		response = self.add_branches(
			repos=data['repos'], data=data, crucible_id=crucible_id)
		if not response['status']:
			return response

		response = self.add_reviewer(
			crucible_id=crucible_id, cred_hash=cred_hash, user=self.temp_user)
		if not response['status']:
			return response

		response = self.publish_review(crucible_id=crucible_id, cred_hash=cred_hash)
		if not response['status']:
			return response

		response = self.delete_reviewer(
			crucible_id=crucible_id, cred_hash=cred_hash, user=self.temp_user)
		if not response['status']:
			return response

		return {'status': True, 'data': crucible_id, 'description': description}

	def close_crucible(self, crucible_id, cred_hash):
		url = f'{self.crucible_api.crucible_api_review}/{crucible_id}/transition?action=action:closeReview&ignoreWarnings=true.json'
		return self.crucible_api.post(url=url, cred_hash=cred_hash)


