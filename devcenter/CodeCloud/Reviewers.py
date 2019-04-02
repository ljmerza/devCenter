"""Handles reviewer's actions on Code Cloud."""


class Reviewers():
	"""Handles reviewer's actions on Code Cloud."""

	def __init__(self, code_cloud_api):
		"""Setup the code cloud API config."""
		self.code_cloud_api = code_cloud_api

	def add_reviewer_to_pull_request(self, username, repo_name, pull_request_id, cred_hash):
		"""Add a reviewer to a pull request."""
		url = f'{self.code_cloud_api.branch_api}/{repo_name}/pull-requests/{pull_request_id}/participants'
		post_data = {
			'user': {
				'name': username,
				'slug': username
			},
			'role': 'REVIEWER'
		}
		response = self.code_cloud_api.post(url=url, json_data=post_data, cred_hash=cred_hash)
		response['data']['repo_name'] = repo_name
		return response

	def pass_pull_request_review(self, username, repo_name, pull_request_id, cred_hash):
		"""Pass a pull request."""
		response = self._change_pull_request_status(
			username=username,
			repo_name=repo_name, 
			pull_request_id=pull_request_id, 
			cred_hash=cred_hash, 
			status='APPROVED'
		)
		response['data']['repo_name'] = repo_name
		return response

	def fail_pull_request_review(self, username, repo_name, pull_request_id, cred_hash):
		"""Fail a pull request."""
		response = self._change_pull_request_status(
			username=username,
			repo_name=repo_name, 
			pull_request_id=pull_request_id, 
			cred_hash=cred_hash, 
			status='NEEDS_WORK'
		)
		response['data']['repo_name'] = repo_name
		return response

	def _change_pull_request_status(self, username, repo_name, pull_request_id, cred_hash, status):
		"""Changes a pull request's status for a user."""
		url = f'{self.code_cloud_api.branch_api}/{repo_name}/pull-requests/{pull_request_id}/participants/{username}'
		post_data = {'status': status}
		response = self.code_cloud_api.put(url=url, json_data=post_data, cred_hash=cred_hash)
		response['data']['repo_name'] = repo_name
		return response