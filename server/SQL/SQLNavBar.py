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
		items = session.query(NavbarItems)
		response = []
		for item in items:
			response.append( self.row2dict(item) )
		return response

	def row2dict(self, row):
		'''
		'''
		d = {}
		for column in row.__table__.columns:
			d[column.name] = str(getattr(row, column.name))
		return d