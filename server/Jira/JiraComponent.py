#!/usr/bin/python3

class JiraComponent():
	def __init__(self, jira_api):
		self.jira_api = jira_api
		self.component_url = f'{self.jira_api.api_base}/issue'

	def _set_component(self, name, key, cred_hash):
		json_data = {"update":{"components":[{"set":[{"name":name}]}]}}
		return self.jira_api.put_json(url=f'{self.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

	def _remove_component(self, name, key, cred_hash):
		json_data = {"update":{"components":[{"remove":{"name":name}}]}}
		return self.jira_api.put_json(url=f'{self.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

	def set_pcr_needed(self, key, cred_hash):
		return self._set_component(key=key, name='PCR - Needed', cred_hash=cred_hash)

	def remove_pcr_needed(self, key, cred_hash):
		return self._remove_component(key=key, name='PCR - Needed', cred_hash=cred_hash)

	def add_pcr_working(self, key, cred_hash):
		return self._remove_component(key=key, name='PCR - Working', cred_hash=cred_hash)

	def remove_pcr_working(self, key, cred_hash):
		return self._remove_component(key=key, name='PCR - Working', cred_hash=cred_hash)

	def set_pcr_complete(self, key, cred_hash):
		return self._set_component(key=key, name='PCR - Completed', cred_hash=cred_hash)

	def remove_pcr_complete(self, key, cred_hash):
		return self._remove_component(key=key, name='PCR - Completed', cred_hash=cred_hash)

	def set_code_review_working(self, key, cred_hash):
		return self._set_component(key=key, name='Code Review - Working', cred_hash=cred_hash)

	def set_merge_code(self, key, cred_hash):
		return self._set_component(key=key, name='Merge Code', cred_hash=cred_hash)

	def remove_merge_code(self, key, cred_hash):
		return self._remove_component(key=key, name='Merge Code', cred_hash=cred_hash)

	def remove_merge_conflict(self, key, cred_hash):
		return self._remove_component(key=key, name='Merge Conflict', cred_hash=cred_hash)

	def set_merge_conflict(self, key, cred_hash):
		return self._set_component(key=key, name='Merge Conflict', cred_hash=cred_hash)

	def remove_merge_conflict(self, key, cred_hash):
		return self._remove_component(key=key, name='Merge Conflict', cred_hash=cred_hash)
