"""Handles all comment actions for code cloud."""


class Comments():
	"""Handles all comment actions for code cloud."""

	def add_comment_to_pull_request(self, repo_name, pull_request_id, comment, cred_hash):
		"""Add a comment to a pull request."""
		url = f'{self.code_cloud_api.branch_api}/{repo_name}/pull-requests/{pull_request_id}/comments'
		response = self.code_cloud_api.post(url=url, json_data={'text':comment}, cred_hash=cred_hash)
		response['data']['repo_name'] = repo_name
		return response

	def get_activities(self, repo_name, pull_request_id, cred_hash):
		"""Get the activity details for a pull request."""
		url = f'{self.code_cloud_api.branch_api}/{repo_name}/pull-requests/{pull_request_id}/activities'
		response = self.code_cloud_api.get(url=url, cred_hash=cred_hash)
		response['data']['repo_name'] = repo_name
		return response