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

	def set_navbar_item(self, session, item):
		'''sets a navbar item

			Args:
				session (Session instance) the session to close
				item (Object) the navbar item to save

			Returns:
				success or error hash

		'''
		response = {'status': False, 'data': 'Unable to save item'}
		row = session.query(NavbarItems).filter(NavbarItems.id == item['id']).first()

		if row is None:
			row = NavbarItems(**item)
			session.add(row)
			response = {'status': True, 'data': 'Added new item'}
		else:
			# else existing ticket exist so update all fields we have
			for key, val in item.items():
				setattr(row, key, val)
			response = {'status': True, 'data': 'Saved item changes'}

		session.commit()
		return response


	def row2dict(self, row):
		'''
		'''
		d = {}
		for column in row.__table__.columns:
			d[column.name] = str(getattr(row, column.name))
		return d