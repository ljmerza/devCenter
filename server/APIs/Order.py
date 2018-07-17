#!/usr/bin/python3
import os
import json

class Order():

	def get_orders(self):
		data = []
		with open('./APIs/data/deep_order_data.json', encoding="utf8") as data_file:    
			data = json.load(data_file)

		return {
			'status': True,
			'data': data
		}