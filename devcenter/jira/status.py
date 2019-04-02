"""Modify Jira ticket statuses."""


class JiraStatus():
	"""Modify Jira ticket statuses."""

	def __init__(self, jira_api):
		"""Set the Jira API this class will use."""
		self.jira_api = jira_api

	def set_status(self, key, transition_id, cred_hash):
		url = f'{self.jira_api.api_base}/issue/{key}/transitions'
		response =  self.jira_api.post_json(url=url, json_data={"transition":{"id":transition_id}}, cred_hash=cred_hash)

		if not response.get('data', False):
			response['data'] = {}
		return response