#!/usr/bin/python3
import os
import json

class OrderAPI():
	'''used as an adapter for Jira API requests'''

	def __init__(self):
		'''			
		'''

	def get_orders(self):
		'''sends a GET request

		Args:
			url (str) the URL to make a POST request

		Returns:
			returns a dict with status/data property. 
		'''
		data = []
		with open('./APIs/data_out.json', encoding="utf8") as data_file:    
			data = json.load(data_file)

		return {
			'status': True,
			'data': data
		}