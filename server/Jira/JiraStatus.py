#!/usr/bin/python3

class JiraStatus():
	def __init__(self, jira_api):
		self.jira_api = jira_api

	def _set_status(self, key, transition_id, cred_hash):
		url = f'{self.jira_api.api_base}/issue/{key}/transitions'
		response =  self.jira_api.post_json(url=url, json_data={"transition":{"id":transition_id}}, cred_hash=cred_hash)

		if not response.get('data', False):
			response['data'] = {}
		return response

	def set_in_dev(self, key, cred_hash):
		return self._set_status(key=key, transition_id=51, cred_hash=cred_hash)

	def set_code_review(self, key, cred_hash):
		return self._set_status(key=key, transition_id=521, cred_hash=cred_hash)

	def set_ready_for_qa(self, key, cred_hash):
		return self._set_status(key=key, transition_id=71, cred_hash=cred_hash)

	def set_in_qa(self, key, cred_hash):
		return self._set_status(key=key, transition_id=541, cred_hash=cred_hash)

	def set_qa_pass(self, key, cred_hash):
		return self._set_status(key=key, transition_id=191, cred_hash=cred_hash)

	def set_qa_fail(self, key, cred_hash):
		return self._set_status(key=key, transition_id=171, cred_hash=cred_hash)

	def set_ready_for_uct(self, key, cred_hash):
		return self._set_status(key=key, transition_id=471, cred_hash=cred_hash)

	def set_in_uct(self, key, cred_hash):
		return self._set_status(key=key, transition_id=561, cred_hash=cred_hash)

	def set_uct_pass(self, key, cred_hash):
		return self._set_status(key=key, transition_id=481, cred_hash=cred_hash)

	def set_uct_fail(self, key, cred_hash):
		return self._set_status(key=key, transition_id=171, cred_hash=cred_hash)

	def set_cr_pass(self, key, cred_hash):
		return self._set_status(key=key, transition_id=461, cred_hash=cred_hash)

	def set_cr_fail(self, key, cred_hash):
		return self._set_status(key=key, transition_id=171, cred_hash=cred_hash)

	def set_ready_for_release(self, key, cred_hash):
		return self._set_status(key=key, transition_id=421, cred_hash=cred_hash)

	def set_in_sprint(self, key, cred_hash):
		return self._set_status(key=key, transition_id=331, cred_hash=cred_hash)

	def set_backlog(self, key, cred_hash):
		return self._set_status(key=key, transition_id=451, cred_hash=cred_hash)

	def set_on_hold(self, key, cred_hash):
		return self._set_status(key=key, transition_id=441, cred_hash=cred_hash)

	def set_close(self, key, cred_hash):
		return self._set_status(key=key, transition_id=221, cred_hash=cred_hash)
