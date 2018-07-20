#!/usr/bin/python3

class Reviewers():
	def __init__(self, code_cloud_api):
		self.code_cloud_api = code_cloud_api

	def add_comment_to_pull_request(self, repo_name, pull_request_id, comment, cred_hash):
		url = f'{self.code_cloud_api.code_cloud_branches_api}/{repo_name}/pull-requests/{pull_request_id}/comments.json'
		return self.code_cloud_api.post(url=url, json_data={'text':comment}, cred_hash=cred_hash)

	def add_reviewer_to_pull_request(self, username, repo_name, pull_request_id, cred_hash):
		return self._change_pull_quest_status(username, repo_name, pull_request_id, cred_hash, role='REVIEWER')

	def pass_pull_request_review(self, username, repo_name, pull_request_id, cred_hash):
		return self._change_pull_quest_status(username, repo_name, pull_request_id, cred_hash, role='"APPROVED"')


	def _change_pull_quest_status(self, username, repo_name, pull_request_id, cred_hash, role):
		url = f'{self.code_cloud_api.code_cloud_branches_api}/{repo_name}/pull-requests/{pull_request_id}/participants/{username}.json'
		post_data = {'role':role}

		return self.code_cloud_api.post(url=url, json_data=post_data, cred_hash=cred_hash)
