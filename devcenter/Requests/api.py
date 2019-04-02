"""Handles all external API requests."""
from devcenter.apis.order import Order


def get_orders():
	"""Gets all order data scrapped from the database."""
	return Order().get_orders()


def get_atx():
	"""Gets all ATX data scrapped from the database."""
	return Order().get_atx()