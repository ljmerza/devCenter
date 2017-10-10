#!/usr/bin/python3

import time
import math

import CrucibleAPI
import CruciblePCR
import CrucibleRepoBranch

class Crucible(CrucibleRepoBranch.CrucibleRepoBranch, CruciblePCR.CruciblePCR):
	def __init__(self):
		CruciblePCR.CruciblePCR.__init__(self)
		CrucibleRepoBranch.CrucibleRepoBranch.__init__(self)

	def get_review_id(self, key, msrp):
		'''try to return a crucible ID for a particular Jira key/MSRP
		Args:
			key (str) the Jira key
			msrp (str) the Jira MSRP

		Returns:
			dict of status property. If fail then contains data property of error message
			else has crucible_id
		'''
		# get last 14 days of crucible reviews and check response
		response = self.get_14_day_reviews()
		if not response['status']:
			return response
		# get Crucible data
		review_titles = reviews['data']['review_titles']
		review_ids = reviews['data']['review_ids']
		# try to find title from key
		return self._get_review_id(key=key, msrp=msrp, review_titles=review_titles, review_ids=review_ids)

	def get_review_ids(self, issues):
		'''gets all Crucible IDs for an array of Jira ticket objects
		Args:
			issues (Array) an array of Jira ticket objects 

		Returns:
			dict of status/data properties. If fail then contains data property of error message
			else has issues with added Crucible IDs
		'''
		# get all reviews in the last 14 days and check response
		reviews = self.get_14_day_reviews()
		if not response['status']:
			return response
		# get Crucible data
		review_titles = reviews['data']['review_titles']
		review_ids = reviews['data']['review_ids']
		# loop though each issue to get crucible link
		for issue in issues['data']:
			# get MSRP and key of issue
			msrp = issue['fields']['customfield_10212']
			key = issue['key']
			# find crucible data of issue
			response = self._get_review_id(msrp=msrp, key=key, review_titles=review_titles, review_ids=review_ids)
			# if found crucible link then add to response
			if response['status']:
				issue['fields']['crucible_id'] = response['data']
		# return issues with added data
		return {'status': False, 'data': issues}

	def get_review_ids_from_keys(self, keys):
		'''gets all Crucible IDs for a array of Jira ticket keys
		Args:
			keys (Array) an array of Jira ticket keys 

		Returns:
			dict of status/data properties. If fail then contains data property of error message
			else array of key/crucbile_id objects
		'''
		# get all reviews in the last 30 days
		reviews = self.get_14_day_reviews()
		if not response['status']:
			return response
		# get Crucible data
		review_titles = reviews['data']['review_titles']
		review_ids = reviews['data']['review_ids']
		# for each key get crucible data
		data = []
		for key in keys:
			response = self._get_review_id(msrp='', key=key, review_titles=review_titles, review_ids=review_ids)
			# if found crucible link then add to response
			if response['status']:
				data.append({'key': key, 'crucible_id': response['data']})
		# return issues with added data
		return {'status': True, 'data': data}


	def _get_review_id(self, key, msrp, review_titles, review_ids):
		'''matches a Crucible ID from an array of msrps/keys and review_titles/review_ids
		Args:
			key (str) the key of the Jira issue
			msrp (str) the MSRP of the Jira issue
			review_titles (Array) array of Crucible titles
			review_ids (Array) array of Crucible IDs
			
		Returns:
			dict of status/data properties. If fail then contains data property of error message
			else as Crucible ID
		'''
		index = [index for index, title in enumerate(review_titles) if key in str(title)]
		# if found by key then return URL
		if len(index):
			return { 'status': True, 'data': review_ids[index[0]] }
		else:
			# else try to find by MSRP
			index = [index for index, title in enumerate(review_titles) if msrp in str(title)]
			# if found by MSRP then return URL
			if len(index):
				return { 'status': True, 'data': review_ids[index[0]] }
			else:
				# else cant find URL so return false status
				return { 'status': False, 'data': 'No crucible ID found' }

	def get_30_day_reviews(self, cred_hash):
		'''gets all closed and open reviews in the last 30 days
		Args:
			days (str) the number of days to look back for Crucible reviews

		Returns:
			dict with status/data properties. Data property has array of
			dicts with review_titles/review_ids properties
		'''
		return self.get_reviews(days=30, cred_hash=cred_hash)

	def get_14_day_reviews(self, cred_hash):
		'''gets all closed and open reviews in the last 14 days
		Args:
			days (str) the number of days to look back for Crucible reviews

		Returns:
			dict with status/data properties. Data property has array of
			dicts with review_titles/review_ids properties
		'''
		return self.get_reviews(days=14, cred_hash=cred_hash)

	def get_7_day_reviews(self, cred_hash):
		'''gets all closed and open reviews in the last 7 days
		Args:
			days (str) the number of days to look back for Crucible reviews

		Returns:
			dict with status/data properties. Data property has array of
			dicts with review_titles/review_ids properties
		'''
		return self.get_reviews(days=7, cred_hash=cred_hash)

	def get_reviews(self, days, cred_hash):
		'''gets all closed and open reviews beginning from passed in number of days
		Args:
			days (str) the number of days to look back for Crucible reviews
			cred_hash (string) Authorization header value

		Returns:
			dict with status/data properties. Data property has array of
			dicts with review_titles/review_ids properties
		'''
		# calc epoch from 'days' days ago
		milli_24_hours = 24*60*60*1000
		milli_days = milli_24_hours * days
		millis = int( round(time.time() * 1000) - milli_days)
		# get crucible data
		response = self.get(url=f'{self.base_url}/rest-service/reviews-v1/filter.json?states=Review,Closed&fromDate={millis}', cred_hash=cred_hash)
		# check response
		if not response['status']:
			return response
		# check if review data exists
		if 'reviewData' not in response['data']:
			return { 'status': False, 'data': "Review data could not be found" }
		# save all open review titles and ids
		data = []
		for review in response['data']['reviewData']:
			data.append({"review_titles": review['name'], "review_ids":review['permaId']['id'] })
		return { 'status': True, 'data': data }

	def create_crucible(self, data):
		'''creates a Crucible review with correct title, adds branches to review, then publishes review

		Args:
			data (dict) contains prperties:
				username (str) username of user to add
				title (str) the title of the Crucible (premade to pass less args)
				repos (Array<str>) array of repo string names to add to new Crucible review

		Returns:
			dict with status/data properties. Data property has array of
			dicts with review_titles/review_ids properties
		'''
		# create JSON data to send to API
		json_data = {"reviewData": {
			"allowReviewersToJoin":"true",
			"author":{"userName":data['username']},
			"creator":{"userName":data['username']},
			"moderator":{"userName":data['username']},
			"description":'',
			"name":title,
			"projectKey":"CR-UD"
		}}
		# create a crucible review
		response = self.post_json(url=f'{self.base_url}/rest-service/reviews-v1.json', json_data=json_data)
		if not response['status']:
			return {'data':  'Could not create crucible review: '+response['data'], 'status': False}
		# make sure we have valid data
		if not response['data'].get('permaId'):
			return {'data': 'Could not get permId: '+response['data'], 'status': False}
		# get Crucible ID
		crucible_id = response['data']['permaId']['id']
		# for each repo add it to review
		for repo in data['repos']:
			json_data = {
				"autoUpdate": "true",
				"baseBranch": repo['baseBranch'],
				"repositoryName": repo['repositoryName'],
				"reviewedBranch": repo['reviewedBranch']
			}
			response = self.post_json(url=f'{self.base_url}/rest/branchreview/latest/trackedbranch/{crucible_id}.json', json_data=json_data)
			if not response['status']:
				json_data = str(json_data)
				return {'data': f'Could not add repo {repo}: '+response['data'], 'status': False}
		# publish review
		response = self.post(url=f'{self.base_url}/rest-service/reviews-v1/{crucible_id}/transition?action=action:approveReview&ignoreWarnings=true.json')
		if not response['status']:
			return {'data': f'Could not publish review: '+response['data'], 'status': False}
		# return crucible id and status ok
		return {'data': crucible_id, 'status': True}


	def close_crucible(self, crucible_id):
		'''closes a Crucible review by ID

		Args:
			crucible_id (str) the Crucible ID to close

		Returns
			dict with status/data properties.
		'''
		return self.post(url=f'{self.base_url}/rest-service/reviews-v1/{crucible_id}/transition?action=action:closeReview&ignoreWarnings=true.json')

