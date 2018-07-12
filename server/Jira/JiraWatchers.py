#!/usr/bin/python3

class JiraWatchers():
	def __init__(self, jira_api):
		self.jira_api = jira_api

	def add_watcher(self, key, cred_hash, username):
		return self.jira_api.post_json(url=f'{self.jira_api.api_base}/issue/{key}/watchers', json_data=username, cred_hash=cred_hash)

	def remove_watcher(self, key, cred_hash, username):
		return self.jira_api.delete(url=f'{self.jira_api.api_base}/issue/{key}/watchers?username={username}', cred_hash=cred_hash)

	def get_watchers(self, key, cred_hash):
		return self.jira_api.get(url=f'{self.jira_api.api_base}/issue/{key}/watchers', cred_hash=cred_hash)
		