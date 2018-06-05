#!/usr/bin/python3
import re

class CrucibleRepoBranch():
	'''
	'''

	def __init__(self, crucible_api):
		'''

		Args:
			
			
		Returns:
			
		'''
		self.crucible_api = crucible_api

		# hard coded repos
		self.repos = ["aqe","external_modules","modules","sasha","taskmaster","teamdb","teamdbapi","teamdb_ember","templates","tqi","ud","ud_api","ud_ember","upm","upm_api","wam","wam_api"]

	def get_repos_of_review(self, crucible_id, cred_hash):
		'''get all repos tied to a review

		Args:
			
			
		Returns:
			
		'''

		# get crucible details
		response = self.crucible_api.get(url=f'{self.crucible_api.crucible_api_review}/{crucible_id}/reviewitems.json', cred_hash=cred_hash)
		# if status false then return error
		if not response['status']:
			return response
		repos = []
		# get all repos for all source files
		for item in response['data']['reviewItem']:
			for file in item['expandedRevisions']:
				repos.append(file['source'])
		return { 'status': True, 'data': list(set(repos)) }

	def get_repos(self, cred_hash, cached=True):
		'''gets all repos a user can access

		Args:
			cred_hash - 
			cached - (boolean) get hard coded repos or get all repos (default True)
			
		Returns:
			a dict of status/data properties
		'''
		data = []
		if cached:
			for repo in self.repos:
				data.append({'name': repo})
		else:
			# get data from API
			response = self.crucible_api.get(url=f'{self.crucible_api.crucible_api_repo}.json', cred_hash=cred_hash)
			if not response['status']:
				return response
			# save all repo names and locations
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
		url = f'{self.crucible_api.code_cloud_branches_api}{repo_name}/branches?start=0&limit=30'
		response = self.crucible_api.get(url=url, cred_hash=cred_hash)
		
		if not response['status']:
			return response
		
		for item in response.get('data', {}).get('values', {}):
			branch_names.append(item.get('displayId', ''))

		return {'status': True, 'data': branch_names}

	def get_commit_ids(self, key, master_branch, cred_hash):
		'''get all commit ids for a Jira ticket
		'''
		commit_ids = []
		for repo_name in self.repos:
			response = self.get_commit_id(repo_name=repo_name, key=key, cred_hash=cred_hash, master_branch=master_branch)
			if response['status'] and response['data']:
				commit_ids.append({'master_branch': master_branch, 'repo_name': repo_name, 'commit_id': response['data']})
		return {'status': len(commit_ids) > 0, 'data': commit_ids}


	def get_commit_id(self, repo_name, master_branch, key, cred_hash):
		''' gets a commit id for a repo and key
		'''
		commit_id = ''

		# get data from API
		url = f'{self.crucible_api.code_cloud_branches_api}{repo_name}/commits?until=refs%2Fheads%2F{master_branch}'
		response = self.crucible_api.get(url=url, cred_hash=cred_hash)
		
		if not response['status']:
			return response

		for item in response.get('data', {}).get('values', {}):
			message = item.get('message', '')
			if key in message:
				commit_id = item.get('id')
		
		return {'status': True, 'data': commit_id}


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
			return {'status': True, 'data': returned_branches, 'all': response['data']}
		else:
			return {'status': False, 'data': f'No branches found with MSRP {msrp}'}


	def ticket_branches(self, msrp, cred_hash):
		''' finds all branches in all repos a user can access with the given MSRP
		Args:
			msrp (str) the MSRP of the Jira ticket
			
		Returns:
			dict of status/data properties. data properties if status True will
			be an array of dicts with repo/branches properties. branches property
			will be an Array of branch names found
		'''

		branches = []
		# for each repo get branches
		for repo in self.repos:
			response = self.find_branch(repo_name=repo, msrp=msrp, cred_hash=cred_hash)
			# if branch found then add to found branches with MSRP
			if response['status']:
				branches.append({'repo': repo, 'branches': response['data'], 'all': response['all']})
		# if found branches then return else return error
		if len(branches) > 0:
			return {'status': True, 'data': branches}
		else:
			return {'status': False, 'data': f'No branches found with MSRP {msrp}'}

	def add_branches(self, repos, data, crucible_id):
		'''
		'''
		# get manual Crucible session
		self.crucible_api.manual_login(username=data['username'], password=data['password'])

		# for each repo add it to review
		for repo in repos:
			json_data = {
				"autoUpdate": "true",
				"baseBranch": repo['baseBranch'],
				"repositoryName": repo['repositoryName'],
				"reviewedBranch": repo['reviewedBranch']
			}

		response = self.crucible_api.manual_post_json(url=f'{self.crucible_api.crucible_api_branch}/{crucible_id}.json', json=json_data)
		if not response['status']:
			return {'status': True, 'data': f'Could not add repo {repo}: '+response['data']}
		return response