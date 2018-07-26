#!/usr/bin/python3
from .SQLModels import NavbarItems

class SQLNavBar():

	def get_navbar_items(self):
		session = self.login()
		items = session.query(NavbarItems)
		response = []

		for item in items:
			response.append( self.row2dict(item) )

		self.logout(session)
		return response

	def set_navbar_item(self, item):
		session = self.login()
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
		self.logout(session)

		return response
