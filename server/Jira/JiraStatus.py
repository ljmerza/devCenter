#!/usr/bin/python3

class JiraStatus():
	'''Jira class for setting statuses and components for Jira tickets'''

	def __init__(self, jira_api):
		'''Creates a JiraStatus class instance

		Args:
			jira_api - a Jira API instance

		Returns:
			a JiraStatus instance
		'''
		self.jira_api = jira_api


	def _set_status(self, transition_id, key, cred_hash):
		'''sets a jira issue to the given status

		Args:
			transition_id (int) the status id to set the jira issue to
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self.jira_api.post_json(url=f'{self.jira_api.api_base}/issue/{key}/transitions', json_data={"transition":{"id":transition_id}}, cred_hash=cred_hash)


	def set_in_dev(self, key, cred_hash):
		'''sets a jira issue to the In Development status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=551, cred_hash=cred_hash)

	def set_code_review(self, key, cred_hash):
		'''sets a jira issue to the Code Review status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=521, cred_hash=cred_hash)

	def set_ready_for_qa(self, key, cred_hash):
		'''sets a jira issue to the Ready For QA status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=71, cred_hash=cred_hash)

	def set_in_qa(self, key, cred_hash):
		'''sets a jira issue to the In QA status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=541, cred_hash=cred_hash)

	def set_qa_pass(self, key, cred_hash):
		'''sets a jira issue to the QA Pass status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=191, cred_hash=cred_hash)

	def set_qa_fail(self, key, cred_hash):
		'''sets a jira issue to the QA Fail status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=171, cred_hash=cred_hash)

	def set_in_uct(self, key):
		'''sets a jira issue to the In UCT status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=561)