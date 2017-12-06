#!/usr/bin/python3

import time

class CrucibleReviewId():
	'''
	'''

	def __init__(self, crucible_api):
		'''

		Args:
			
			
		Returns:
			
		'''
		self.crucible_api = crucible_api
		

	def get_review_id(self, cred_hash, key='', msrp=''):
		'''try to return a crucible ID for a particular Jira key/MSRP
		Args:
			key (str) the Jira key
			msrp (str) the Jira MSRP

		Returns:
			dict of status property. If fail then contains data property of error message
			else has crucible_id
		'''
		# get last 14 days of crucible reviews and check response
		response = self.get_14_day_reviews(cred_hash=cred_hash)
		if not ['status']:
			return response
		# try to find title from key
		return self._get_review_id(key=key, msrp=msrp, reviews=response['data'])

	def get_review_ids(self, issues, cred_hash):
		'''gets all Crucible IDs for an array of Jira ticket objects
		Args:
			issues (Array) an array of Jira ticket objects 

		Returns:
			dict of status/data properties. If fail then contains data property of error message
			else has issues with added Crucible IDs
		'''
		# get all reviews in the last 14 days and check response
		response_reviews = self.get_14_day_reviews(cred_hash=cred_hash)
		if not response_reviews['status']:
			return response_reviews

		# loop though each issue to get crucible link
		for issue in issues:
			# get MSRP and key of issue
			msrp = issue.get('msrp', '')
			key = issue.get('key', '')
			# find crucible data of issue
			response = self._get_review_id(msrp=msrp, key=key, reviews=response_reviews['data'])
			# if found crucible link then add to response
			if response['status']:
				issue['crucible_id'] = response['data']
		# return issues with added data
		return {'status': True, 'data': issues}

	def get_review_ids_from_keys(self, keys, cred_hash):
		'''gets all Crucible IDs for a array of Jira ticket keys
		Args:
			keys (Array) an array of Jira ticket keys 

		Returns:
			dict of status/data properties. If fail then contains data property of error message
			else array of key/crucbile_id objects
		'''
		# get all reviews in the last 30 days
		response_reviews = self.get_14_day_reviews(cred_hash=cred_hash)
		if not response_reviews['status']:
			return response_reviews		
		# for each key get crucible data
		data = []
		for key in keys:
			response = self._get_review_id(msrp='', key=key, reviews=response_reviews['data'])
			# if found crucible link then add to response
			if response['status']:
				data.append({'key': key, 'crucible_id': response['data']})
		# return issues with added data
		return {'status': True, 'data': data}


	def _get_review_id(self, key, msrp, reviews):
		'''matches a Crucible ID from an array of msrps/keys and review_title/review_id
		Args:
			key (str) the key of the Jira issue
			msrp (str) the MSRP of the Jira issue
			reviews (Array) array of Crucible Review items with review_title/review_id properties
			
		Returns:
			dict of status/data properties. If fail then contains data property of error message
			else as Crucible ID
		'''
		# for each review see if there is a MSRP or key match
		for review in reviews:
			if( (key and str(key) in review['review_title']) or (msrp and str(msrp) in review['review_title']) ):
				return { 'status': True, 'data': review['review_id'] }
		#  cant find URL so return false status
		return { 'status': False, 'data': f'MSRP {msrp} : key {key}' }

	def get_30_day_reviews(self, cred_hash):
		'''gets all closed and open reviews in the last 30 days
		Args:
			days (str) the number of days to look back for Crucible reviews

		Returns:
			dict with status/data properties. Data property has array of
			dicts with review_titles/review_ids properties
		'''
		return self._get_reviews(days=30, cred_hash=cred_hash)

	def get_14_day_reviews(self, cred_hash):
		'''gets all closed and open reviews in the last 14 days
		Args:
			days (str) the number of days to look back for Crucible reviews

		Returns:
			dict with status/data properties. Data property has array of
			dicts with review_titles/review_ids properties
		'''
		return self._get_reviews(days=14, cred_hash=cred_hash)

	def get_7_day_reviews(self, cred_hash):
		'''gets all closed and open reviews in the last 7 days
		Args:
			days (str) the number of days to look back for Crucible reviews

		Returns:
			dict with status/data properties. Data property has array of
			dicts with review_titles/review_ids properties
		'''
		return self._get_reviews(days=7, cred_hash=cred_hash)

	def _get_reviews(self, days, cred_hash):
		'''gets all closed and open reviews beginning from passed in number of days
		Args:
			days (str) the number of days to look back for Crucible reviews
			cred_hash (string) Authorization header value

		Returns:
			dict with status/data properties. Data property has array of
			dicts with review_title/review_id properties
		'''
		# calc epoch from 'days' days ago
		milli_24_hours = 24*60*60*1000
		milli_days = milli_24_hours * days
		millis = int( round(time.time() * 1000) - milli_days)
		# get crucible data
		response = self.crucible_api.get(url=f'{self.crucible_api.crucible_api_review}/filter.json?states=Review,Closed&fromDate={millis}', cred_hash=cred_hash)
		# check response
		if not response['status']:
			return response
		# check if review data exists
		if 'reviewData' not in response['data']:
			return { 'status': False, 'data': "Review data could not be found" }
		# save all open review titles and ids
		data = []
		for review in response['data']['reviewData']:
			data.append({"review_title": review['name'], "review_id":review['permaId']['id'] })
		return { 'status': True, 'data': data }