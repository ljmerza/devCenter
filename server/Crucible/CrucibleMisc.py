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


	def create_crucible(self, data, cred_hash):
		'''creates a Crucible review with correct title, adds branches to review, then publishes review

		Args:
			data (dict) contains properties:
				username (str) username of user to add
				password (str) password of user to add
				title (str) the title of the Crucible (premade to pass less args)
				repos (Array<str>) array of repo string names to add to new Crucible review

		Returns:
			dict with status/data properties.
		'''
		# create JSON data to send to API

		json_data = {"reviewData": {
			"allowReviewersToJoin":"true",
			"author":{"userName":data['username']},
			"creator":{"userName":data['username']},
			"moderator":{"userName":data['username']},
			"description":'',
			"name": data['title'],
			"projectKey":"CR-UD"
		}}
		
		# create a crucible review
		response = self.crucible_api.post_json(url=f'{self.crucible_api.crucible_api_review}.json', json_data=json_data, cred_hash=cred_hash)
		if not response['status']:
			return {'data':  'Could not create crucible review: '+response['data'], 'status': False}

		# make sure we have valid data
		if 'permaId' not in response['data']:
			return {'data': 'Could not get permId: '+response['data'], 'status': False}

		# get Crucible ID
		crucible_id = response['data']['permaId']['id']
		
		# get manual Crucible session
		self.crucible_api.manual_login(username=data['username'], password=data['password'])

		# for each repo add it to review
		for repo in data['repos']:
			json_data = {
				"autoUpdate": "true",
				"baseBranch": repo['baseBranch'],
				"repositoryName": repo['repositoryName'],
				"reviewedBranch": repo['reviewedBranch']
			}
			response = self.crucible_api.manual_post_json(url=f'{self.crucible_api.crucible_api_branch}/{crucible_id}.json', json=json_data)
			if not response['status']:
				return {'status': False, 'data': f'Could not add repo {repo}: '+response['data']}

		# publish review
		response = self.crucible_api.manual_post_json(url=f'{self.crucible_api.crucible_api_review}/{crucible_id}/transition?action=action:approveReview&ignoreWarnings=true.json')
		if not response['status']:
			return {'status': False, 'data': f'Could not publish review: '+response['data']}
		
		# return crucible id and status ok
		return {'status': True, 'data': crucible_id}


	def close_crucible(self, crucible_id, cred_hash):
		'''closes a Crucible review by ID

		Args:
			crucible_id (str) the Crucible ID to close

		Returns
			dict with status/data properties.
		'''
		return self.crucible_api.post(url=f'{self.crucible_api.crucible_api_review}/{crucible_id}/transition?action=action:closeReview&ignoreWarnings=true.json', cred_hash=cred_hash)
