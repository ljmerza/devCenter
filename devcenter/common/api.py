"""Over all API for Dev Center."""
import json


class DevCenterAPI():
	"""Overall API for Dev Center."""

	@classmethod
	def _is_json(cls, my_json):
		"""Is the data strucutre valid JSON?"""
		try:
			json_object = json.loads(my_json)
		except ValueError:
			return False
		return True

	def _process_json(self, filter_data):
		"""Process the return JSON from an API."""
		# if we have filter data and an okay status then try to parse
		if filter_data and filter_data.status_code in [200,201,204]:
			if self._is_json(my_json=filter_data.text):
				return { "status": True, "data": json.loads(filter_data.text)}
			else:
				return { "status": True }
		else:
			# else we don't have an okay status so get error and return false status
			if self._is_json(my_json=filter_data.text):
				return { "status": False, "data": json.loads(filter_data.text) }
			else:
				return { "status": False, "data": filter_data.text }

	@classmethod
	def _process_response(cls, response):
		"""Process a raw response from an API."""
		if 'status' not in response:
			return { "status": False, "data": 'There was no status given' }

		elif not response['status']:
			if 'data' not in response:
				return { "status": False, "data":  'Unknown error' }

			elif isinstance(response['data'], dict) and 'message' in response['data']:
				return { "status": False, "data": response['data']['message'] }

			else:
				return { "status": False, "data": response['data'] }
		
		else:
			return response