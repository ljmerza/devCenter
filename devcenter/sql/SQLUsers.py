#!/usr/bin/python3

from .SQLModels import Users, Tickets

class SQLUsers():
	def __init__(self, project_managers):
		self.project_managers = project_managers

	def update_ping(self, field, key, value=0):
		session = self.login()
		response = ''

		row = session.query(Tickets).filter(Tickets.key == key).first()
		if row:
			setattr(row, field, value)
			session.commit()
			response =  {'status': True}
		else:
			response =  {'status': False, 'data': f'DevCenterSQL::update_ping::Could not find key {key} to change {field} to {value}'}

		self.logout(session)
		return response

	def get_user_ping_value(self, username, field):
		'''
		Returns:
			2 if project manager or username not assigned
			1 if user wants ping (from given ping or all_ping field)
			0 if user does not want ping
		'''

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
		session = self.login()
		response = ''
		row = session.query(Users).filter(Users.username == username).first()

		if row is not None:
			response = {'status': True, 'data':  self.row2dict(row)}
		else:
			response = {'status': False, 'data': row}

		self.logout(session)
		return response

	def set_user_ping_value(self, username, field, value):
		session = self.login()
		fields = [{'name':field, 'value':value}]
		response = self.set_user_pings(username, fields, session)
		self.logout(session)
		return response
	
	def set_user_pings(self, username, fields):
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

	def reset_pings(self, ping_type, key):
		if ping_type in ['conflict_ping','cr_fail_ping','uct_fail_ping','qa_fail_ping']:
			session = self.login()
			row = session.query(Tickets).filter(Tickets.key == key).first()

			row.pcr_ping = 0
			row.merge_ping = 0
			row.conflict_ping = 0
			row.qa_ping = 0
			row.uct_fail_ping = 0
			row.cr_fail_ping = 0
			row.uct_ping = 0
			row.qa_fail_ping = 0

			session.commit()
			self.logout(session)

	def get_ping(self, field, key):
		session = self.login()
		response = 0

		row = session.query(Tickets).filter(Tickets.key == key).first()
		if row:
			response = getattr(row, field)
			
		self.logout(session)
		return response

	def get_pings(self, key):
		session = self.login()
		response = session.query(Tickets).filter(Tickets.key == key).first()
		self.logout(session)
		return response
