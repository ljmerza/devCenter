"""Actions to get user data from DB."""
import os

from .models import Users, Tickets
from devcenter.server_utils import row2dict


class SQLUsers():
	"""Actions to get user data from DB."""
	
	project_managers = os.environ['PM'].split(',')

	def get_user_ping_value(self, username, field):
		"""Gets a user's ping value.
		Returns:
			2 if project manager or username not assigned
			1 if user wants ping (from given ping or all_ping field)
			0 if user does not want ping
		"""

		# if ticket is assigned to pm then ignore
		# if a pm or not assigned yet return 2
		if(username in self.project_managers or not username):
			return 2

		else:
			response = 0
			session = self.login()
			# else get user setting and return it
			row = session.query(Users).filter(Users.username == username).first()
			if row is not None:
				if(getattr(row, field) or row.all_ping):
					response = 1
			else:
				# else we don't even have a user so add them and return 0
				row = Users(username=username)
				session.add(row)
				session.commit()
 
			self.logout(session)
			return response

	def get_user_ping_values(self):
		"""Gets all of a user's ping values."""
		session = self.login()
		response = ''
		row = session.query(Users).filter(Users.username == username).first()

		if row is not None:
			response = {'status': True, 'data':  row2dict(row)}
		else:
			response = {'status': False, 'data': row}

		self.logout(session)
		return response

	def set_user_ping_value(self, username, field, value):
		"""Set a user's ping value."""
		session = self.login()
		fields = [{'name':field, 'value':value}]
		response = self.set_user_pings(username, fields, session)
		self.logout(session)
		return response
	
	def set_user_pings(self, username, fields):
		"""Set's multiple user ping values."""
		session = self.login()
		response = ''

		row = session.query(Users).filter(Users.username == username).first()
		if row is not None:
			try:
				# for each field wanting to save - update user field
				for field in fields:
					setattr(row, field['name'], field['value'])
				# commit and return true when done
				session.commit()
				response = {'status': True}
			except Exception as err:
				response = {'status': False, 'data': f'DevCenterSQL::set_user_pings::{err}'}
		else:
			response = {'status': False, 'data': f'DevCenterSQL::set_user_pings::Could not find username "{username}"'}

		self.logout(session)
		return response