#!/usr/bin/python3

import CrucibleAPI

class CrucibleRepoBranch(CrucibleAPI.CrucibleAPI):
	def __init__(self):
		CrucibleAPI.CrucibleAPI.__init__(self)

	def get_repos_of_review(self, crucible_key):
		'''get all repos tied to a review
		'''
		# get crucible details
		response = self.get(url=f'{self.base_url}/rest-service/reviews-v1/{crucible_key}/reviewitems.json')
		# if status false then return error
		if not response['status']:
			return response
		repos = []
		# get all repos for all source files
		for item in response['data']['reviewItem']:
			for file in item['expandedRevisions']:
				repos.append(file['source'])
		return { 'status': True, 'data': list(set(repos)) }

	def get_repos(self):
		repo_names = []
		repo_locations = []
		# get data from API
		response = self.get(f'{self.base_url}/rest-service/repositories-v1.json')
		if not response['status']:
			return repo_names, repo_locations
		# save all repo names and locations
		for review in response['data']['repoData']:
			repo_names.append(review['name'])
			repo_locations.append(review['location'])
		return repo_names, repo_locations


	def get_branches(self, repo_name):
		branch_names = []
		# get data from API
		response = self.get(f'{self.base_url}/changelog-ajax/{repo_name}?q=&command=branches&limit=50')
		if not response['status']:
			return branch_names
		for item in response['data']['items']:
			branch_names.append(item['id'])
		return branch_names


	def find_branch(self, repo_name, msrp):
		returned_branch = False
		branch_names = self.get_branches(repo_name=repo_name)
		for branch_name in branch_names:
			if msrp in branch_name:
				returned_branch = branch_name
		return returned_branch