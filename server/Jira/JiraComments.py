#!/usr/bin/python3

import datetime
from time import gmtime, strftime
from JiraUtils import *


class JiraComments():
	'''Creates a JiraComments class instance
	'''
	def __init__(self, jira_api):
		'''Create JiraComments class instance

		Args:
			jira_api - a Jira API instance

		Returns:
			a JiraComments instance
		'''
		self.jira_api = jira_api

	def add_comment(self, key, cred_hash, comment='', private_comment=True, uct_date=''):
		'''adds a comment to a jira issue. By default the comment is
		set to developer view only

		Args:
			key (str) the jira issue key to update
			comment (str) the comment to post to the jira issue
			cred_hash (str) Authorization header value
			private_comment (boolean) is the comment developer only or public? (default true)
			uct_date (str) if uct ready string added then user date from client timezone

		Returns:
			dict: status boolean and/or data hash
		'''

		# add uct not ready if wanted 
		if uct_date:
			uct_date = datetime.datetime.fromtimestamp(uct_date)
			uct_comment = uct_date.strftime('h3. {color:red}UCT not ready as of %B %d, %Y %I:%M %p {color}')
			comment = f"{comment}\n{uct_comment}"

		json_data = self._set_json(comment=comment, private_comment=private_comment)
		return self.jira_api.post_json(url=f'{self.jira_api.api_base}/issue/{key}/comment?expand=renderedBody', json_data=json_data, cred_hash=cred_hash)
		
	def edit_comment(self, key, comment_id, cred_hash, comment, private_comment=True):
		'''
		'''
		json_data = self._set_json(comment=comment, private_comment=private_comment)
		return self.jira_api.put_json(url=f'{self.jira_api.api_base}/issue/{key}/comment/{comment_id}?expand=renderedBody', json_data=json_data, cred_hash=cred_hash)

	def delete_comment(self, key, comment_id, cred_hash):
		return self.jira_api.delete(url=f'{self.jira_api.api_base}/issue/{key}/comment/{comment_id}', cred_hash=cred_hash)

	def _set_json(self, comment, private_comment):
		'''
		'''
		json_data = {"body": comment}
		if private_comment:
			json_data['visibility'] = {'type': 'role', 'value': 'Developers'}
		return json_data

	def parse_comment(self, cred_hash, comment, key):
		'''
		'''
		json_data = {
			'rendererType': 'atlassian-wiki-renderer',
			'unrenderedMarkup': comment,
			'issueKey': key
		}
		return self.jira_api.post_json(url=f'{self.jira_api.api_base}/render', json_data=json_data, cred_hash=cred_hash)

	def format_return(self, response):
		'''
		'''
		return {
			'data': {'comment': response['data']},
			'status': True
		}
		