#!/usr/bin/python3

class Reviewers():
	def __init__(self, code_cloud_api):
		self.code_cloud_api = code_cloud_api

	def add_reviewer_to_pull_request(self, username, repo_name, pull_request_id, cred_hash):
		return self._change_pull_request_status(username, repo_name, pull_request_id, cred_hash, role='REVIEWER')

	def pass_pull_request_review(self, username, repo_name, pull_request_id, cred_hash):
		return self._change_pull_request_status(username, repo_name, pull_request_id, cred_hash, role='APPROVED')

	def fail_pull_request_review(self, username, repo_name, pull_request_id, cred_hash):
		return self._change_pull_request_status(username, repo_name, pull_request_id, cred_hash, role='NEEDS_WORK')

	def _change_pull_request_status(self, username, repo_name, pull_request_id, cred_hash, role):
		url = f'{self.code_cloud_api.branch_api}/{repo_name}/pull-requests/{pull_request_id}/participants'
		post_data = {
			'role':role,
			'user': {
				'name': username,
				'slug': username
			}
		}
		return self.code_cloud_api.post(url=url, json_data=post_data, cred_hash=cred_hash)
