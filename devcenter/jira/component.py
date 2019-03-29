"""Modifiy a Jira Ticket's Component."""


class JiraComponent():
	"""Modifiy a Jira Ticket's Component."""

	def __init__(self, jira_api):
		"""."""
		self.jira_api = jira_api
		self.component_url = f'{self.jira_api.api_base}/issue'

	def set_component(self, name, key, cred_hash):
		"""Set a component for a Jira Ticket."""
		json_data = {"update":{"components":[{"set":[{"name":name}]}]}}
		response = self.jira_api.put_json(url=f'{self.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

		if not response.get('data', False):
			response['data'] = {}
		return response

	def set_components(self, names, key, cred_hash):
		"""Set multiple components for a Jira ticket."""
		components = []
		for name in names:
			components.append({"name":name})

		json_data = {"update":{"components":[{"set":components}]}}
		response = self.jira_api.put_json(url=f'{self.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

		if not response.get('data', False):
			response['data'] = {}
		return response

	def _remove_component(self, name, key, cred_hash):
		"""Remove a component for a Jira ticket."""
		json_data = {"update":{"components":[{"remove":{"name":name}}]}}
		return self.jira_api.put_json(url=f'{self.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

	def _remove_components(self, names, key, cred_hash):
		"""Remove multiple components for a Jira ticket."""
		components = []
		for name in names:
			components.append({"name":name})

		json_data = {"update":{"components":[{"remove":components}]}}
		return self.jira_api.put_json(url=f'{self.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

	def set_pcr_needed(self, key, cred_hash):
		"""Set Jira ticket component to PCR - Needed."""
		return self.set_component(key=key, name='PCR - Needed', cred_hash=cred_hash)

	def remove_pcr_needed(self, key, cred_hash):
		"""Remove PCR - Needed from Jira ticket."""
		return self._remove_component(key=key, name='PCR - Needed', cred_hash=cred_hash)

	def set_pcr_working(self, key, cred_hash):
		"""Set Jira ticket component to PCR - Working."""
		return self.set_component(key=key, name='PCR - Working', cred_hash=cred_hash)

	def remove_pcr_working(self, key, cred_hash):
		"""Remove PCR - Working from Jira ticket."""
		return self._remove_component(key=key, name='PCR - Working', cred_hash=cred_hash)

	def set_pcr_complete(self, key, cred_hash):
		"""Set Jira ticket component to PCR - Completed."""
		return self.set_component(key=key, name='PCR - Completed', cred_hash=cred_hash)

	def remove_pcr_complete(self, key, cred_hash):
		"""Remove PCR - Completed from Jira ticket."""
		return self._remove_component(key=key, name='PCR - Completed', cred_hash=cred_hash)

	def set_code_review_working(self, key, cred_hash):
		"""Set Jira ticket component to Code Review - Working."""
		return self.set_component(key=key, name='Code Review - Working', cred_hash=cred_hash)
	
	def remove_code_review_working(self, key, cred_hash):
		"""Remove Code Review - Working from Jira ticket."""
		return self._remove_component(key=key, name='Code Review - Working', cred_hash=cred_hash)

	def set_merge_code(self, key, cred_hash):
		"""Set Jira ticket component to Merge Code."""
		return self.set_component(key=key, name='Merge Code', cred_hash=cred_hash)

	def remove_merge_code(self, key, cred_hash):
		"""Remove Merge Code from Jira ticket."""
		return self._remove_component(key=key, name='Merge Code', cred_hash=cred_hash)

	def set_merge_conflict(self, key, cred_hash):
		"""Set Jira ticket component to Merge Conflict."""
		return self.set_component(key=key, name='Merge Conflict', cred_hash=cred_hash)

	def remove_merge_conflict(self, key, cred_hash):
		"""Remove Merge Conflict from Jira ticket."""
		return self._remove_component(key=key, name='Merge Conflict', cred_hash=cred_hash)