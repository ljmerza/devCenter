"""Actions for navbar in the DB."""
from .models import NavbarItems, JqlLinks
from devcenter.server_utils import row2dict

class SQLNavBar():
	"""Actions for navbar in the DB."""

	def get_navbar_items(self):
		"""Gets all navbar items from DB."""
		session = self.login()
		items = session.query(NavbarItems)
		response = [row2dict(item) for item in items]
		self.logout(session)
		return response

	def get_jql_links(self):
		"""Gets all JQL links for the DB."""
		session = self.login()
		items = session.query(JqlLinks)
		response = [row2dict(item) for item in items]
		self.logout(session)
		return response

	def set_navbar_item(self, item):
		"""Sets a navbar item's data."""
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