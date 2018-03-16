#!/usr/bin/python3
import os

from DevCenterSQL import DevCenterSQL
from APISQL import APISQL
from DevCenterAPI import DevCenterAPI
import SQLModels
import json
import subprocess
import sys

class OrderAPI(DevCenterAPI, APISQL):
	'''used as an adapter for Jira API requests'''

	def __init__(self):
		'''

		Args:
			None

		Returns:
			
		'''

		self.attESSec = os.environ['ATTSEC']
		self.attuid = os.environ['ORDER_ID']
		self.url = os.environ['ORDER_URL']

		query_strings = {
			'querynumber': 1494,
			'BMP': 1,
			'EM': 1,
			'IVR': 1,
			'NCT': 1,
			'SNMP': 1,
			'ET': 1,
			'MSRP': 1,
			'OT': 1,
			'UC': 0,
			'PNCD1': 0,
			'CE': 0,
			'MWMST': 0,
			'LRAP': 0,
			'ATIP': 0,
			'DI': 0
		}

		APISQL.__init__(self)
		DevCenterAPI.__init__(self)

		self.get_fields()


		# build queery string
		query_string = ''
		for key, value in query_strings.items():
			query_string += f'&{key}={value}'

		# add fields to retrieve
		fields = ','.join(self.all_fields)
		query_string += f'&fields={fields}&allFields={fields}'

		self.full_url = f'{self.url}{query_string}'

	def get_fields(self):

		session = self.login()

		order_items = session.query(SQLModels.OrderItems)

		self.all_fields = []
		self.display_names = []

		for order in order_items:
			if order.odbFieldName != 'ExpandRow':
				self.all_fields.append(order.odbFieldName)
				field_name = order.odbFieldName.replace('.', '_')
				self.display_names.append({
					'field_name': field_name, 
					'table_name': order.odbFieldName.split('.'),
					'display_name': order.displayName
				})


		self.all_fields.append('Core.ATX_Uso')
		self.display_names.append({
			'field_name': 'Core.ATX_Uso', 
			'display_name': 'Core.ATX_Uso'
			})

		self.logout(session=session)


	def get_orders(self):
		'''sends a GET request

		Args:
			url (str) the URL to make a POST request

		Returns:
			returns a dict with status/data property. 
		'''
		cookies = {
			'attESSec': self.attESSec,
			'attuid': self.attuid
		}

		response = super(OrderAPI, self).get(url=self.full_url, cookies=cookies)
		if response['status']:
			response = self.format_orders(response)
		return response

	def format_orders(self, response):
		orders = response['data'].get('aaData', False)
		if not orders:
			return response
		
		formatted_orders = []

		for idx, order in enumerate(orders):
			new_order = {}
			for key, value in order.items():
				try:
					index = int(key)
					field_name = self.all_fields[index]
					field_name = field_name.replace('.', '_')
					new_order[field_name] = value

				except Exception as e:
					pass
			formatted_orders.append(new_order)

		return {
			'status': True,
			'data': formatted_orders,
			'display_names': self.display_names,
			'extra_data': self.merge_orders()
		}

	def merge_orders(self):
		'''
		'''

		# perl_script = subprocess.Popen(["script.pl", params], stdout=sys.stdout)
		# perl_script.communicate()

		with open('./APIs/data_out.json') as data_file:    
			data = json.load(data_file)
			return data