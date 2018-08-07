#!/usr/bin/python3
import os
import json

class Order():

	def get_orders(self):
		data = []
		try:
			with open('./server/APIs/data/deep_order_data.json', encoding="utf8") as data_file:    
				data = json.load(data_file)
			return {'status': True, 'data': data}

		except Exception as err:
			return {'status': False, 'data': f'Could not find JSON data: {err}'}