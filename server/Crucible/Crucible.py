#!/usr/bin/python3

import time
import math

from . import CrucibleAPI
from . import CruciblePCR

class Crucible(CrucibleAPI.CrucibleAPI, CruciblePCR.CruciblePCR):
	def __init__(self):
		CrucibleAPI.CrucibleAPI.__init__(self)
		CruciblePCR.CruciblePCR.__init__(self)

	def get_review_link(self, key, msrp, full_link=True):
		'''try to return a crucible link for a particular Jira key/msrp
		Args:
			key (str)
			msrp (str)
			full_link (boolean)

		Returns:
			dict of status property. If fil then contains data property of error message
			else has crucible_id
		'''
		response = { "status": False }
		# get last 14 days of crucible reviews and check response
		reviews = self.get_14_day_reviews()
		if not reviews['status']:
			response['data'] = reviews['data']
			return response
		# try to find title from key
		index = [index for index, title in enumerate(reviews['titles']) if key in str(title)]
		# if found by key then return URL
		if len(index):
			response['status'] = True
			response['crucible_id'] = reviews['crucible_ids'][index[0]]
			return response
		else:
			# else try to find by MSRP
			index = [index for index, title in enumerate(reviews['titles']) if msrp in str(title)]
			# if found by MSRP then return URL
			if len(index):
				response['status'] = True
				response['crucible_id'] = reviews['crucible_ids'][index[0]]
				return response
			else:
				# else cant find URL so return false status
				return response

	def get_review_links(self, data):

		# get issue and create response object
		issues = data['data']
		response = { "status": False }

		# get all reviews in the last 14 days
		reviews = self.get_14_day_reviews()
		# if we couldn't get reviews -> save error and return 
		if not reviews['status']:
			response['data'] = reviews['data']
			return response
		# if we did get data then loop though each issue to get crucible link
		for issue in issues:
			# get MSRP and key of issue
			msrp = issue['fields']['customfield_10212']
			key = issue['key']
			# find crucible data of issue
			review = self.find_review_data(msrp=msrp, key=key, reviews=reviews)
			# if found crucible link then add to response
			if review['status']:
				issue['fields']['crucible_link'] = review['crucible_link']
				issue['fields']['crucible_id'] = review['crucible_id']
		# save  issues with added data
		response['data'] = issues
		return response

	def get_all_review_links(self, keys):

		# create response object
		response = { "status": False }
		# get all reviews in the last 30 days
		reviews = self.get_30_day_reviews()
		# if we couldn't get reviews -> save error and return 
		if not reviews['status']:
			response['data'] = reviews['data']
			return response
		# if we got data then we are okay
		response['status'] = True
		# for each key get crucible data
		for key in keys:
			review = self.find_review_data(key=key, reviews=reviews)
			if review['status']:
				response['data'].append({ "key": key, "crucible_link": review['crucible_link'], "crucible_id":review['crucible_id'] })
		return response

	def get_review_id(self, msrp='', key='', cred_hash=''):

		reviews = self.get_14_day_reviews(cred_hash=cred_hash)
		if not reviews['status']:
			response['data'] = reviews['data']
			return response
		return self.find_review_data(msrp=msrp, key=key, reviews=reviews)

	def find_review_data(self, titles, ids, msrp='', key=''):
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

		# create response objects
		response = { "status": False }
		review_titles = []
		review_ids = []
		# calc epoch from 'days' days ago
		milli_24_hours = 24*60*60*1000
		milli_days = milli_24_hours * days
		millis = int( round(time.time() * 1000) - milli_days)
		# get crucible data
		response = self.get_endpoint_data(url=f'{self.base_url}/rest-service/reviews-v1/filter.json?states=Review,Closed&fromDate={millis}', cred_hash=cred_hash)
		if not response['status']:
			response['data'] = response
			return response
		# save all open review titles and ids
		for review in response['data']['reviewData']:
			review_titles.append(review['name'])
			review_ids.append(review['permaId']['id'])
		return { "status": True, "review_titles": review_titles, "review_ids":review_ids }


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

