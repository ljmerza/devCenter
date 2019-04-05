"""Handles a ticket's watchers."""


class JiraWatchers():
	"""Handles a ticket's watchers."""

	def add_watcher(self, key, cred_hash, username):
		"""Add a watcher for a Jira ticket."""
		return self.jira_api.post_json(url=f'{self.jira_api.api_base}/issue/{key}/watchers', json_data=username, cred_hash=cred_hash)

	def remove_watcher(self, key, cred_hash, username):
		"""Remove a watcher for a Jira ticket."""
		return self.jira_api.delete(url=f'{self.jira_api.api_base}/issue/{key}/watchers?username={username}', cred_hash=cred_hash)

	def get_watchers(self, key, cred_hash):
		"""Get all watchers for a Jira ticket."""
		return self.jira_api.get(url=f'{self.jira_api.api_base}/issue/{key}/watchers', cred_hash=cred_hash)