"""Modify Jira ticket statuses."""


class JiraStatus():
	"""Modify Jira ticket statuses."""

	def __init__(self, jira_api):
		"""Set the Jira API this class will use."""
		self.jira_api = jira_api

	def _set_status(self, key, transition_id, cred_hash):
		url = f'{self.jira_api.api_base}/issue/{key}/transitions'
		response =  self.jira_api.post_json(url=url, json_data={"transition":{"id":transition_id}}, cred_hash=cred_hash)

		if not response.get('data', False):
			response['data'] = {}
		return response

	def set_in_sprint(self, key, cred_hash):
		"""Set status to in sprint."""
		return self._set_status(key=key, transition_id=331, cred_hash=cred_hash)

	def set_backlog(self, key, cred_hash):
		"""Set status to blacklog."""
		return self._set_status(key=key, transition_id=451, cred_hash=cred_hash)

	def set_in_dev(self, key, cred_hash):
		"""Set status to in development."""
		return self._set_status(key=key, transition_id=51, cred_hash=cred_hash)

	def set_code_review(self, key, cred_hash):
		"""Set status to code review."""
		return self._set_status(key=key, transition_id=521, cred_hash=cred_hash)

	def set_ready_for_qa(self, key, cred_hash):
		"""Set status to ready for qa."""
		return self._set_status(key=key, transition_id=71, cred_hash=cred_hash)

	def set_in_qa(self, key, cred_hash):
		"""Set status to in qa."""
		return self._set_status(key=key, transition_id=541, cred_hash=cred_hash)

	def set_qa_pass(self, key, cred_hash):
		"""Set status to qa pass."""
		return self._set_status(key=key, transition_id=191, cred_hash=cred_hash)

	def set_qa_fail(self, key, cred_hash):
		"""Set status to qa fail."""
		return self._set_status(key=key, transition_id=171, cred_hash=cred_hash)

	def set_ready_for_uct(self, key, cred_hash):
		"""Set status to ready for uct."""
		return self._set_status(key=key, transition_id=471, cred_hash=cred_hash)

	def set_in_uct(self, key, cred_hash):
		"""Set status to in uct."""
		return self._set_status(key=key, transition_id=561, cred_hash=cred_hash)

	def set_uct_pass(self, key, cred_hash):
		"""Set status to uct pass."""
		return self._set_status(key=key, transition_id=481, cred_hash=cred_hash)

	def set_uct_fail(self, key, cred_hash):
		"""Set status to uct fail."""
		return self._set_status(key=key, transition_id=171, cred_hash=cred_hash)

	def set_cr_pass(self, key, cred_hash):
		"""Set status to cr pass."""
		return self._set_status(key=key, transition_id=461, cred_hash=cred_hash)

	def set_cr_fail(self, key, cred_hash):
		"""Set status to cr fail."""
		return self._set_status(key=key, transition_id=171, cred_hash=cred_hash)

	def set_ready_for_release(self, key, cred_hash):
		"""Set status to ready for release."""
		return self._set_status(key=key, transition_id=421, cred_hash=cred_hash)

	def set_on_hold(self, key, cred_hash):
		"""Set status to on hold."""
		return self._set_status(key=key, transition_id=441, cred_hash=cred_hash)

	def set_close(self, key, cred_hash):
		"""Set status to closed."""
		return self._set_status(key=key, transition_id=221, cred_hash=cred_hash)