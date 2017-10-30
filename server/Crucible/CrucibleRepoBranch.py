#!/usr/bin/python3

from CrucibleAPI import CrucibleAPI

class CrucibleRepoBranch(CrucibleAPI):
	def __init__(self):
		CrucibleAPI.__init__(self)

	def get_repos_of_review(self, crucible_id, cred_hash):
		'''get all repos tied to a review
		'''
		# get crucible details
		response = self.get(url=f'{self.crucible_api_review}/{crucible_id}/reviewitems.json', cred_hash=cred_hash)
		# if status false then return error
		if not response['status']:
			return response
		repos = []
		# get all repos for all source files
		for item in response['data']['reviewItem']:
			for file in item['expandedRevisions']:
				repos.append(file['source'])
		return { 'status': True, 'data': list(set(repos)) }

	def get_repos(self, cred_hash):
		'''gets all repos a user can access
		Args:
			cred_hash - 
			
		Returns:
			a dict of status/data properties
		'''
		# get data from API
		response = self.get(url=f'{self.crucible_api_repo}.json', cred_hash=cred_hash)
		if not response['status']:
			return response
		# save all repo names and locations
		data = []
		for review in response['data']['repoData']:
			data.append({'name': review['name'], 'location':review['location']})
		return {'status': True, 'data': data}


	def get_branches(self, repo_name, cred_hash):
		''' get all branches for a repo name - limit of 50 branches
		Args:
			repo_name (str) the name of the repo to get the branches from
			
		Returns:
			a dict of status/data properties
		'''
		branch_names = []
		# get data from API
		response = self.get(url=f'{self.crucible_api_changelog}/{repo_name}?q=&command=branches&limit=50', cred_hash=cred_hash)
		if not response['status']:
			return response
		for item in response['data']['items']:
			branch_names.append(item['id'])
		return {'status': True, 'data': branch_names}


	def find_branch(self, repo_name, msrp, cred_hash):
		''' finds a branch in a repo with the given MSRP
		Args:
			repo_name (str) the name of the repo
			msrp (str) the MSRP of the Jira ticket
			
		Returns:
			dict of status/data properties
		'''
		returned_branches = []
		# get all branches for a repo
		response = self.get_branches(repo_name=repo_name, cred_hash=cred_hash)
		if not response['status']:
			return response
		# for each branch returned, if the MSRP is in the branch name then get that branch name
		for branch_name in response['data']:
			if msrp in branch_name:
				returned_branches.append(branch_name)
		# if found branches then return else return error
		if len(returned_branches) > 0:
			return {'status': True, 'data': returned_branches}
		else:
			return {'status': False, 'data': f'No branch found with MSRP {msrp}'}


	def find_branches(self, msrp, cred_hash):
		''' finds all branches in all repos a user can access with the given MSRP
		Args:
			msrp (str) the MSRP of the Jira ticket
			
		Returns:
			dict of status/data properties. data properties if status True will
			be an array of dicts with repo/branches properties. branches property
			will be an Array of branch names found
		'''
		# get all repoes
		response = self.get_repos(cred_hash=cred_hash)
		if not response['status']:
			return response
		branches = []
		# for each repo get branches
		for repo in response['data']:
			response = self.find_branch(repo_name=repo['name'], msrp=msrp, cred_hash=cred_hash)
			# if branch found then add to found branches with MSRP
			if response['status']:
				branches.append({'repo': repo['name'], 'branches': response['data']})
		# if found branches then return else return error
		if len(branches) > 0:
			return {'status': True, 'data': branches}
		else:
			return {'status': False, 'data': f'No branches found with MSRP {msrp}'}