"""Gets order data."""
import json
import os


class Order():
	"""Gets order data."""
	dir_path = os.path.dirname(os.path.realpath(__file__))

	def get_orders(self):
		"""Get all orders saved."""
		return self.get_json(file_name='deep_order_data', file_type='Order')

	def get_atx(self):
		"""Get all ATX orders saved."""
		return self.get_json(file_name='atx_data', file_type='ATX')

	def get_json(self, file_name, file_type):
		"""Get a local JSON file."""
		data = []

		try:
			with open(f'{self.dir_path}/data/{file_name}.json', encoding="utf8") as data_file:    
				data = json.load(data_file)
			return {'status': True, 'data': data}

		except Exception as err:
			return {'status': False, 'data': f'Could not find JSON {file_type} data: {err}'}