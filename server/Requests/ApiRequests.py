#!/usr/bin/python3

from APIs.Order import Order

def get_orders():
	'''gets all order data scrapped from the database
	'''
	return Order().get_orders()

def get_atx():
	'''gets all ATX data scrapped from the database
	'''
	return Order().get_atx()