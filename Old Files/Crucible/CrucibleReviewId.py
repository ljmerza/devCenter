#!/usr/bin/python3

import time

class CrucibleReviewId():
	def __init__(self, crucible_api):
		self.crucible_api = crucible_api

	def get_review_id(self, cred_hash, key='', msrp=''):
		response = self._get_reviews(days=14, cred_hash=cred_hash)
		if not ['status']:
			return response

		return self._get_review_id(key=key, msrp=msrp, reviews=response['data'])

	def _get_review_id(self, key, msrp, reviews):
		for review in reviews:
			if( (key and str(key) in review['review_title']) or (msrp and str(msrp) in review['review_title']) ):
				return { 'status': True, 'data': review['review_id'] }

		return { 'status': False, 'data': f'MSRP {msrp} : key {key}' }

	def _get_reviews(self, days, cred_hash):

		# calc epoch from 'days' days ago
		milli_24_hours = 24*60*60*1000
		milli_days = milli_24_hours * days
		millis = int( round(time.time() * 1000) - milli_days)

		url = f'{self.crucible_api.crucible_api_review}/filter.json?states=Review,Closed&fromDate={millis}'
		response = self.crucible_api.get(url=url, cred_hash=cred_hash)
		if not response['status']:
			return response

		if 'reviewData' not in response['data']:
			return { 'status': False, 'data': "Review data could not be found" }

		data = []
		for review in response['data']['reviewData']:
			data.append({"review_title": review['name'], "review_id":review['permaId']['id'] })
			
		return { 'status': True, 'data': data }
