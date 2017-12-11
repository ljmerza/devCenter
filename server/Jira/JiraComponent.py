#!/usr/bin/python3

class JiraComponent():
	'''Jira class for setting statuses and components for Jira tickets'''

	def __init__(self, jira_api):
		'''Create JiraComponent class instance

		Args:
			jira_api - a Jira API instance

		Returns:
			a JiraComponent instance
		'''
		self.jira_api = jira_api

	def _set_component(self, name, key, cred_hash):
		'''sets a jira issue to the given component

		Args:
			name (str) the component name to set the jira issue to
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		json_data = {"update":{"components":[{"set":[{"name":name}]}]}}
		return self.jira_api.put_json(url=f'{self.jira_api.api_base}/issue/{key}', json_data=json_data, cred_hash=cred_hash)

	def _remove_component(self, name, key, cred_hash):
		'''removes a jira issue to the given component

		Args:
			name (str) the component name to remove the jira issue from
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		json_data = {"update":{"components":[{"remove":{"name":name}}]}}
		return self.jira_api.put_json(url=f'{self.jira_api.api_base}/issue/{key}', json_data=json_data, cred_hash=cred_hash)

	def set_pcr_needed(self, key, cred_hash):
		'''sets a jira issue to the PCR Needed component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='PCR - Needed', cred_hash=cred_hash)

	def set_pcr_complete(self, key, cred_hash):
		'''sets a jira issue to the PCR complete component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='PCR - Completed', cred_hash=cred_hash)

	def set_code_review_working(self, key, cred_hash):
		'''sets a jira issue to the Code Review - Working component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='Code Review - Working', cred_hash=cred_hash)

	def set_merge_code(self, key, cred_hash):
		'''sets a jira issue to the Merge Code component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='Merge Code', cred_hash=cred_hash)

	def remove_merge_code(self, key, cred_hash):
		'''removes a jira issue's Merge Code component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._remove_component(key=key, name='Merge Code', cred_hash=cred_hash)

	def set_merge_conflict(self, key, cred_hash):
		'''sets a jira issue to the Merge Conflict component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='Merge Conflict', cred_hash=cred_hash)

	def remove_merge_conflict(self, key, cred_hash):
		'''sets a jira issue to the Merge Conflict component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._remove_component(key=key, name='Merge Conflict', cred_hash=cred_hash)