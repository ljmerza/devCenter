#!/usr/bin/python3

import JiraAPI
import JiraFields

class Jira(JiraAPI.JiraAPI):
	'''jira class using an attuid and password'''

	def __init__(self):

		super().__init__()
		###############################################################################
		self.base_url = os.environ['JIRA_URL']
		self.ticket_base = f'{self.base_url}/browse' # the ticket page


	def get_filter_url(self, filter_number, cred_hash):
		'''
		'''
		response = self.get(url=f'{self.base_url}/rest/api/2/filter/{filter_number}', cred_hash=cred_hash)
		if not response['status']:
			return response
		return {'status': True, 'data': response['data']['searchUrl'] }



	def get_jira_tickets(self, filter_number, cred_hash, start_at=0, max_results=1000):
		'''
		'''
		# get filter url
		response = self.get_filter_url(filter_number)
		if not response['status']:
			return response
		# get raw url
		url = response['data']
		# get filter data
		response = self.get(url=f'{url}&startAt={start_at}&maxResults={max_results}&fields={self.fields}', cred_hash=cred_hash)
		if not response['status']:
			return response
		return {'status': True, 'data': response_jira['data']['issues']}



	def get_raw_jira_data(self, filter_number, cred_hash, max_results=1000, start_at=0):
		'''
		'''
		# get jira tickets and check response
		response = self.get_jira_tickets(filter_number=filter_number, max_results=max_results, start_at=start_at, cred_hash=cred_hash)
		if not response['status']:
			return response

		# get all issues
		issues = response['data']['data']['issues']

		# create response
		response = {
				"total_tickets": response_jira['data']['data']['total'],
				"data": [],
				'status': True
		}

		# for each ticket get data
		for issue in issues:

			ticket = {}

			# get key
			ticket['key'] = JiraFields.get_key(issue)
			# get msrp
			ticket['msrp'] = JiraFields.get_msrp(issue)

			# get summary
			ticket['summary'] = JiraFields.get_summary(issue)
			# get username
			ticket['username'] = JiraFields.get_username(issue)

			# get component
			ticket['component'] = JiraFields.get_component(issue)
			# get status
			ticket['status'] = JiraFields.get_status(issue)

			# get story points
			ticket['story_points'] = JiraFields.get_story_points(issue)
			# get sprint
			ticket['sprint']  = JiraFields.get_sprint(issue)
			
			# get epic link
			ticket['epic_link'] = JiraFields.get_epic_link(issue)
			# get labels
			ticket['label'] = JiraFields.get_label(issue)

			# get comments and QA steps
			ticket['comments'] = JiraFields.get_comments(issue)
			ticket['qa_steps'] = JiraFields.get_qa_steps(issue)

			# add ticket to response
			response['data'].append(ticket)
		return response


	def find_key_by_msrp(self, msrp, cred_hash):
		'''
		'''
		response = self.get(url=f'{self.api_base}/search?jql=MSRP_Number~{msrp}', cred_hash=cred_hash)
		if not response['status']:
			return response
		if len(response['data']['issues']):
			return {'status': True, 'data': response['data']['issues'][0]['key']}
		else:
			return {'status': False, 'data': f'Did not find any key matching {msrp}'}

	def find_qa_data(self, msrp, cred_hash):
		'''
		'''
		search_response = self.get(url=f'{self.api_base}/search?jql=MSRP_Number~{msrp}', cred_hash=cred_hash)
		if not search_response['status']:
			return search_response

		# get issue found
		search_response = issue['data']['issues'][0]
		# create response object
		response = { 'status': True, 'data':{} }
		# add 
		if search_response['fields']['customfield_10006']:
			response['data']['story_point'] = issue['fields']['customfield_10006']
		# add key
		if search_response['key']:
			response['data']['key'] = issue['key']
		# add summary
		if search_response['fields']['summary']:
			response['data']['summary'] = issue['fields']['summary']
		# return data
		return response

	def add_comment(self, key, comment, cred_hash, private_comment=True):
		'''adds a comment to a jira issue. By default the comment is
		set to developer view only

		Args:
			key (str) the jira issue key to update
			comment (str) the comment to post to the jira issue
			private_comment (boolean) is the comment developer only or public? (default true)

		Returns:
			dict: status boolean and/or data hash
		'''
		json_data = {"body": comment}
		if private_comment:
			json_data['visibility'] = {'type': 'role', 'value': 'Developers'}
		return self.post_json(url=f'{self.api_base}/issue/{key}/comment', json_data=json_data, cred_hash=cred_hash)


	def _set_component(self, component_name, key, cred_hash):
		'''sets a jira issue to the given component

		Args:
			component_name (str) the component name to set the jira issue to
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		json_data = {"update":{"components":[{"set":[{"name":component_name}]}]}}
		return self.put_json(url=f'{self.api_base}/issue/{key}', json_data=json_data, cred_hash=cred_hash)

	def _remove_component(self, component_name, key, cred_hash):
		'''removes a jira issue to the given component

		Args:
			component_name (str) the component name to remove the jira issue from
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		json_data={"update":{"components":[{"remove":[{"name":component_name}]}]}}
		return self.put_json(url=f'{self.api_base}/issue/{key}', json_data=json_data, cred_hash=cred_hash)

	def _set_status(self, transition_id, key, cred_hash):
		'''sets a jira issue to the given status

		Args:
			transition_id (int) the status id to set the jira issue to
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self.post_json(url=f'{self.api_base}/issue/{key}/transitions', json_data={"transition":{"id":transition_id}}, cred_hash=cred_hash)


	def set_in_dev(self, key, cred_hash):
		'''sets a jira issue to the In Development status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=0, cred_hash=cred_hash)

	def set_pcr_needed(self, key, cred_hash):
		'''sets a jira issue to the PCR Needed component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='PCR - Needed', cred_hash=cred_hash)

	def set_pcr_complete(self, key, cred_hash):
		'''sets a jira issue to the PCR complete component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='PCR - Completed', cred_hash=cred_hash)

	def set_code_review(self, key, cred_hash):
		'''sets a jira issue to the Code Review status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=521, cred_hash=cred_hash)

	def set_code_review_working(self, key, cred_hash):
		'''sets a jira issue to the Code Review - Working component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='Code Review - Working', cred_hash=cred_hash)

	def set_ready_for_qa(self, key, cred_hash):
		'''sets a jira issue to the Ready For QA status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=71, cred_hash=cred_hash)

	def set_in_qa(self, key, cred_hash):
		'''sets a jira issue to the In QA status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_status(key=key, transition_id=81, cred_hash=cred_hash)

	# def set_ready_uct(self, key):
	'''sets a jira issue to the Ready For UCT status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
	# 	return self._set_status(key=key, transition_id=0)

	def set_merge_code(self, key, cred_hash):
		'''sets a jira issue to the Merge Code component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='Merge Code', cred_hash=cred_hash)

	def set_merge_conflict(self, key, cred_hash):
		'''sets a jira issue to the Merge Conflict component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='Merge Conflict', cred_hash=cred_hash)

	# def set_in_uct(self, key):
	'''sets a jira issue to the In UCT status

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
	# 	return self._set_status(key=key, transition_id=0)

	def set_uct_fail(self, key, cred_hash):
		'''sets a jira issue to the UCT Fail component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='UCT - Failed', cred_hash=cred_hash)

	def set_ready_release(self, key, cred_hash):
		'''sets a jira issue to the Ready For Release component

		Args:
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''
		return self._set_component(key=key, component_name='Ready for Release', cred_hash=cred_hash)


	def add_work_log(self, time, key, cred_hash, private_log=True):
		'''add worklog time to a Jira issue

		Args:
			time (str): the time logged in '3d 3h 30m 20s' format
			key (str) the jira issue key to update

		Returns:
			dict: status boolean and/or data hash
		'''

		json_data = {
			'comment': '', 
			'started': strftime("%Y-%m-%dT%H:%M:%S.000+0000", gmtime()), 
			'timeSpentSeconds': time,
			'notifyUsers': False
		}

		if private_log:
			json_data['visibility'] = {'type': 'role', 'value': 'Developers'}


		return self.post_json(url=f'{self.api_base}/issue/{key}/worklog', json_data={"timeSpent":time}, cred_hash=cred_hash)
		
	


	

	
	
	
	


