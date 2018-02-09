#!/usr/bin/python3
from SQLModels import *

class SQLNavBar():

	def get_navbar_items(self, session):
		'''gets all href link items for the navbar

			Args:
				session (Session instance) the session to close

			Returns:
				All entries in navbar_items table

		'''
		return session.query(NavbarItems)