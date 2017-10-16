#!/usr/bin/python3

import JiraAPI

class JiraStatusComponent(JiraAPI.JiraAPI):
	'''Jira class for setting statuses and components for Jira tickets'''

	def __init__(self):
		'''Create JiraStatusComponent class instance

		Args:
			None

		Returns:
			a JiraStatusComponent instance
		'''
		JiraAPI.JiraAPI.__init__(self)

	def _set_component(self, name, key, cred_hash):
		'''sets a jira issue to the given component

		Args:
			name (str) the component name to set the jira issue to
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		json_data = {"update":{"components":[{"set":[{"name":name}]}]}}
		return self.put_json(url=f'{self.api_base}/issue/{key}', json_data=json_data, cred_hash=cred_hash)

	def _remove_component(self, name, key, cred_hash):
		'''removes a jira issue to the given component

		Args:
			name (str) the component name to remove the jira issue from
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		json_data={"update":{"components":[{"remove":[{"name":name}]}]}}
		return self.put_json(url=f'{self.api_base}/issue/{key}', json_data=json_data, cred_hash=cred_hash)

	def _set_status(self, transition_id, key, cred_hash):
		'''sets a jira issue to the given status

		Args:
			transition_id (int) the status id to set the jira issue to
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self.post_json(url=f'{self.api_base}/issue/{key}/transitions', json_data={"transition":{"id":transition_id}}, cred_hash=cred_hash)


	def set_in_dev(self, key, cred_hash):
		'''sets a jira issue to the In Development status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, name='In Development', cred_hash=cred_hash)

	def set_pcr_needed(self, key, cred_hash):
		'''sets a jira issue to the PCR Needed component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='PCR - Needed', cred_hash=cred_hash)

	def set_pcr_complete(self, key, cred_hash):
		'''sets a jira issue to the PCR complete component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='PCR - Completed', cred_hash=cred_hash)

	def set_code_review(self, key, cred_hash):
		'''sets a jira issue to the Code Review status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, name='Code Review', cred_hash=cred_hash)

	def set_code_review_working(self, key, cred_hash):
		'''sets a jira issue to the Code Review - Working component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='Code Review - Working', cred_hash=cred_hash)

	def set_ready_for_qa(self, key, cred_hash):
		'''sets a jira issue to the Ready For QA status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, name='Ready for QA', cred_hash=cred_hash)

	def set_in_qa(self, key, cred_hash):
		'''sets a jira issue to the In QA status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, name='In QA', cred_hash=cred_hash)

	def set_ready_uct(self, key):
		'''sets a jira issue to the Ready For UCT status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, name='Ready for UCT')

	def set_merge_code(self, key, cred_hash):
		'''sets a jira issue to the Merge Code component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='Merge Code', cred_hash=cred_hash)

	def set_merge_conflict(self, key, cred_hash):
		'''sets a jira issue to the Merge Conflict component

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='Merge Conflict', cred_hash=cred_hash)

	def set_in_uct(self, key):
		'''sets a jira issue to the In UCT status

		Args:
			key (str) the jira issue key to update
			cred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, name='In UCT')

	def set_uct_fail(self, key, cred_hash):
		'''sets a jira issue to the UCT Fail component

		Args:
			key (str) the jira issue key to updatecred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='UCT - Failed', cred_hash=cred_hash)

	def set_ready_release(self, key, cred_hash):
		'''sets a jira issue to the Ready For Release component

		Args:
			key (str) the jira issue key to updatecred_hash (str) Authorization header value

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, name='Ready for Release', cred_hash=cred_hash)