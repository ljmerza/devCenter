"""Modifiy a Jira Ticket's Component."""


class JiraComponent():
	"""Modifiy a Jira Ticket's Component."""

	def set_component(self, name, key, cred_hash):
		"""Set a component for a Jira Ticket."""
		json_data = {"update":{"components":[{"set":[{"name":name}]}]}}
		response = self.jira_api.put_json(url=f'{self.jira_api.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

		if not response.get('data', False):
			response['data'] = {}
		return response
	
	def set_component_by_id(self, id, key, cred_hash):
		"""Set a component for a Jira Ticket by id."""
		json_data = {"update":{"components":[{"set":[{"id":id}]}]}}
		response = self.jira_api.put_json(url=f'{self.jira_api.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

		if not response.get('data', False):
			response['data'] = {}
		return response

	def set_components(self, names, key, cred_hash):
		"""Set multiple components for a Jira ticket."""
		components = []
		for name in names:
			components.append({"name":name})

		json_data = {"update":{"components":[{"set":components}]}}
		response = self.jira_api.put_json(url=f'{self.jira_api.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

		if not response.get('data', False):
			response['data'] = {}
		return response

	def remove_component(self, name, key, cred_hash):
		"""Remove a component for a Jira ticket."""
		json_data = {"update":{"components":[{"remove":{"name":name}}]}}
		return self.jira_api.put_json(url=f'{self.jira_api.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

	def remove_component_by_id(self, id, key, cred_hash):
		"""Remove a component for a Jira ticket by id."""
		json_data = {"update":{"components":[{"remove":{"id":id}}]}}
		return self.jira_api.put_json(url=f'{self.jira_api.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)

	def remove_components(self, names, key, cred_hash):
		"""Remove multiple components for a Jira ticket."""
		components = []
		for name in names:
			components.append({"name":name})

		json_data = {"update":{"components":[{"remove":components}]}}
		return self.jira_api.put_json(url=f'{self.jira_api.component_url}/{key}', json_data=json_data, cred_hash=cred_hash)