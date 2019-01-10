#!/usr/bin/python3

import datetime
from time import gmtime, strftime
from .JiraFields import format_comment


class JiraComments():
	def __init__(self, jira_api):
		self.jira_api = jira_api

	def add_comment(self, key, cred_hash, private_comment, comment=''):
		json_data = self._set_json(comment=comment, private_comment=private_comment)
		url=f'{self.jira_api.api_base}/issue/{key}/comment?expand=renderedBody'
		response = self.jira_api.post_json(url=url, json_data=json_data, cred_hash=cred_hash)

		if not response.get('status', False):
			return response
		else:
			return {
				'status': True,
				'data':  format_comment(comment=response.get('data'), key=key)
			}
		
	def edit_comment(self, key, comment_id, cred_hash, private_comment, comment=''):
		json_data = self._set_json(comment=comment, private_comment=private_comment)
		url = f'{self.jira_api.api_base}/issue/{key}/comment/{comment_id}?expand=renderedBody'
		response = self.jira_api.put_json(url=url, json_data=json_data, cred_hash=cred_hash)

		if not response.get('status', False):
			return response
		else:
			return {
				'status': True,
				'data':  format_comment(comment=response.get('data'), key=key)
			}

	def delete_comment(self, key, comment_id, cred_hash):
		response =  self.jira_api.delete(url=f'{self.jira_api.api_base}/issue/{key}/comment/{comment_id}', cred_hash=cred_hash)
		# save key/comment id on return hash
		response['data'] = {'key':key, 'comment_id': comment_id}
		return response

	def _set_json(self, comment, private_comment):
		json_data = {"body": comment}
		if private_comment:
			json_data['visibility'] = {'type': 'role', 'value': 'Developers'}
		else:
			json_data['visibility'] = {}

		return json_data

	def parse_comment(self, cred_hash, comment, key):
		json_data = {
			'rendererType': 'atlassian-wiki-renderer',
			'unrenderedMarkup': comment,
			'issueKey': key
		}
		return self.jira_api.post_json(url=f'{self.jira_api.api_base}/render', json_data=json_data, cred_hash=cred_hash)
		