"""Modify Jira ticket statuses."""


class JiraStatus():
	"""Modify Jira ticket statuses."""

	def set_status(self, key, transition_id, cred_hash):
		url = f'{self.jira_api.api_base}/issue/{key}/transitions'
		response =  self.jira_api.post_json(url=url, json_data={"transition":{"id":transition_id}}, cred_hash=cred_hash)

		if not response.get('data', False):
			response['data'] = {}
		return response