#!/usr/bin/python3

import time
import math

import CrucibleAPI
import CruciblePCR

class Crucible(CrucibleAPI.CrucibleAPI, CruciblePCR.CruciblePCR):
	def __init__(self):
		CrucibleAPI.CrucibleAPI.__init__(self)
		CruciblePCR.CruciblePCR.__init__(self)

	def get_review_link(self, key, msrp, full_link=True):
		'''try to return a crucible link for a particular jira key/msrp'''
		titles, ids = self.get_14_day_reviews()
		# try to find title from key
		if titles:
			index = [index for index, title in enumerate(titles) if key in str(title)]
			# if found by key then return url
			if len(index):
				if full_link:
					return f'{self.review_url}/{ids[index[0]]}'
				else:
					return ids[index[0]]
			else:
				# else try to find by msrp
				index = [index for index, title in enumerate(titles) if msrp in str(title)]
				# if found by msrp then return url
				if len(index):
					if full_link:
						return f'{self.review_url}/{ids[index[0]]}'
					else:
						return ids[index[0]]
				else:
					# else cant find url so return false
					return False
		else:
			False

	def get_review_links(self, data):
		issues = data['data']
		titles, ids = self.get_14_day_reviews()
		for issue in issues:
			msrp = issue['fields']['customfield_10212']
			key = issue['key']
			crucible_id, link = self.find_review_link(msrp=msrp, key=key, titles=titles, ids=ids)
			if crucible_id:
				issue['fields']['crucible_link'] = link
				issue['fields']['crucible_id'] = crucible_id
		data['data'] = issues
		return data

	def get_all_review_links(self, keys):
		return_data = []
		titles, ids = self.get_30_day_reviews()
		for key in keys:
			crucible_id, link = self.find_review_link(key=key, titles=titles, ids=ids)
			if crucible_id:
				return_data.append({"key": key, "crucible_link": link, "crucible_id":crucible_id})
		return return_data

	def get_review_id(self, msrp='', key='', cred_hash=''):
		titles, ids = self.get_14_day_reviews(cred_hash=cred_hash)
		return self.find_review_link(msrp=msrp, key=key, titles=titles, ids=ids)

	def find_review_link(self, titles, ids, msrp='', key=''):
		# try to find by msrp
		if msrp:
			index = [index for index, title in enumerate(titles) if msrp in str(title)]
			if len(index):
				return ids[index[0]], f"{self.review_url}/{ids[index[0]]}"
		# try to find title from key
		elif key:
			index = [index for index, title in enumerate(titles) if key in str(title)]
			if len(index):
				return ids[index[0]], f"{self.review_url}/{ids[index[0]]}"
		# else cant find url so return false
		return False, False


	def get_repos_of_review(self, crucible_key):
		# get crucible details
		response = self.get_endpoint_data(url=f'{self.base_url}/rest-service/reviews-v1/{crucible_key}/reviewitems.json')
		if not response['status']:
			return []
		repos = []
		# get all repos for all source files
		for item in response['data']['reviewItem']:
			for file in item['expandedRevisions']:
				repos.append(file['source'])
		return list(set(repos))


	def get_30_day_reviews(self):
		return self.get_reviews(days=30, cred_hash=cred_hash)


	def get_14_day_reviews(self, cred_hash=''):
		return self.get_reviews(days=14, cred_hash=cred_hash)

	def get_7_day_reviews(self):
		return self.get_reviews(days=7, cred_hash=cred_hash)


	def get_reviews(self, days, cred_hash=''):
		review_titles = []
		review_ids = []
		# calc epoch from 'days' days ago
		milli_24_hours = 24*60*60*1000
		milli_days = milli_24_hours * days
		millis = int( round(time.time() * 1000) - milli_days)
		# get crucible data
		response = self.get_endpoint_data(f'{self.base_url}/rest-service/reviews-v1/filter.json?states=Review,Closed&fromDate={millis}', cred_hash=cred_hash)
		if not response['status']:
			return review_titles, review_ids 
		# save all open review titles and ids
		for review in response['data']['reviewData']:
			review_titles.append(review['name'])
			review_ids.append(review['permaId']['id'])
		return review_titles, review_ids


	def get_repos(self):
		repo_names = []
		repo_locations = []
		# get data from API
		response = self.get_endpoint_data(f'{self.base_url}/rest-service/repositories-v1.json')
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
		response = self.get_endpoint_data(f'{self.base_url}/changelog-ajax/{repo_name}?q=&command=branches&limit=50')
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


	def create_crucible_title(self, story_points, key, msrp, summary):
		pcr_estimate = self.get_pcr_estimate(story_points)
		return f'(PCR-{pcr_estimate}) [{key}] Ticket #{msrp} {summary}'


	def create_crucible(self, data):
		attuid = data['attuid']
		title = data['title']
		repos = data['repos']

		json_data = {"reviewData": {
			"allowReviewersToJoin":"true",
			"author":{"userName":attuid},
			"creator":{"userName":attuid},
			"moderator":{"userName":attuid},
			"description":'',
			"name":title,
			"projectKey":"CR-UD"
		}}
		
		# create a crucible review
		response = self.json_post_endpoint_data(url=f'{self.base_url}/rest-service/reviews-v1.json', json_data=json_data)
		if not response['status']:
			return {"response": 'Could not create crucible review: '+response['data']['message'], "status": response['status']}

		# make sure we have valid data
		if not response['data'].get('permaId'):
			return {"response":'create_crucible::Could not get permId: '+response['data']['message'], "status": response['status']}
		crucible_id = response['data']['permaId']['id']

		# for each repo add it to review
		for repo in repos:
			json_data = {
				"autoUpdate": "true",
				"baseBranch": repo['baseBranch'],
				"repositoryName": repo['repositoryName'],
				"reviewedBranch": repo['reviewedBranch']
			}
			
			response = self.json_post_endpoint_data(url=f'{self.base_url}/rest/branchreview/latest/trackedbranch/{crucible_id}.json', json_data=json_data)
			if not response['status']:
				json_data = str(json_data)
				return {"response":f'Could not add repo {json_data}: '+response['data'], "status":response['status']}

		# publish review
		response = self.post_endpoint_data(url=f'{self.base_url}/rest-service/reviews-v1/{crucible_id}/transition?action=action:approveReview&ignoreWarnings=true.json')
		if not response['status']:
			return {"response":f'Could not publish review: '+response['data'], "status": response['status']}

		# return crucible id and status ok
		return {"response":crucible_id, "status":"OK"}


	def close_crucible(self, crucible_id):
		return self.post_endpoint_data(url=f'{self.base_url}/rest-service/reviews-v1/{crucible_id}/transition?action=action:closeReview&ignoreWarnings=true.json')

