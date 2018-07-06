#!/usr/bin/python3

class CrucibleMisc():
	'''
	'''

	def __init__(self, crucible_api):
		'''

		Args:
			
			
		Returns:
			
		'''
		self.crucible_api = crucible_api
		self.temp_user = 'sk213d'


	def generate_crucible(self, data, cred_hash, pull_response):
		'''generates a Crucible review with correct title, adds branches to review, then publishes review

		Args:
			data (dict) contains properties:
				username (str) username of user to add
				password (str) password of user to add
				title (str) the title of the Crucible (premade to pass less args)
				repos (Array<str>) array of repo string names to add to new Crucible review
			pull_response (dict) pull requests from bitbucket

		Returns:
			dict with status/data properties.
		'''
		response = self.create_crucible(data=data, cred_hash=cred_hash, pull_response=pull_response)
		if not response['status']:
			return response
		crucible_id = response.get('data')
		description = response.get('description')

		response = self.add_branches(repos=data['repos'], data=data, crucible_id=crucible_id)
		if not response['status']:
			return response
		
		response = self.add_reviewer(crucible_id=crucible_id, cred_hash=cred_hash, user=self.temp_user)
		if not response['status']:
			return response

		response = self.publish_review(crucible_id=crucible_id, cred_hash=cred_hash)
		if not response['status']:
			return response

		response = self.delete_reviewer(crucible_id=crucible_id, cred_hash=cred_hash, user=self.temp_user)
		if not response['status']:
			return response
		
		return {'status': True, 'data': crucible_id, 'description': description}


	def close_crucible(self, crucible_id, cred_hash):
		'''closes a Crucible review by ID

		Args:
			crucible_id (str) the Crucible ID to close

		Returns
			dict with status/data properties.
		'''
		return self.crucible_api.post(url=f'{self.crucible_api.crucible_api_review}/{crucible_id}/transition?action=action:closeReview&ignoreWarnings=true.json', cred_hash=cred_hash)

	def get_pull_request_link(self, pull_response, repositoryName):
		'''try to get pull request link from pull request response
		'''
		pull_request_link = ''

		if pull_response.get('status', False):
			for request in pull_response.get('data'):

				if request.get('status', False):
					repo_name = request.get('data').get('toRef').get('repository').get('name')

					if repo_name.lower() == repositoryName.lower():
						pull_request_link = request.get('data').get('links').get('self')[0].get('href')

		return pull_request_link