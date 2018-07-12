#!/usr/bin/python3

from .SQLModels import Users, Tickets

class SQLUsers():
	def __init__(self, project_managers):
		self.project_managers = project_managers

	def update_ping(self, field, key, session, value=0):
		row = session.query(Tickets).filter(Tickets.key == key).first()
		if row:
			setattr(row, field, value)
			session.commit()
			return {'status': True}
		else:
			return {'status': False, 'data': f'DevCenterSQL::update_ping::Could not find key {key} to change {field} to {value}'}

	def get_user_ping_value(self, username, field, session):
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
			# else get user setting and return it
			row = session.query(Users).filter(Users.username == username).first()
			if row is not None:
				if(getattr(row, field) or row.all_ping):
					return 1
				else:
					return 0
			else:
				row = Users(username=username)
				session.add(row)
				session.commit()
				return 0

	def get_user_ping_values(self, username, session):
		row = session.query(Users).filter(Users.username == username).first()
		if row is not None:
			return {'status': True, 'data':  self.row2dict(row)}
		else:
			return {'status': False, 'data': row}

	def set_user_ping_value(self, username, field, value, session):
		fields = [{'name':field, 'value':value}]
		return self.set_user_pings(username, fields, session)
	
	def set_user_pings(self, username, fields, session):
		row = session.query(Users).filter(Users.username == username).first()
		if row is not None:
			try:
				# for each field wanting to save - update user field
				for field in fields:
					setattr(row, field['name'], field['value'])
				# commit and return true when done
				session.commit()
				return {'status': True}
			except Exception as err:
				return {'status': False, 'data': f'DevCenterSQL::set_user_pings::{err}'}
		else:
			return {'status': False, 'data': f'DevCenterSQL::set_user_pings::Could not find username "{username}"'}

	def reset_pings(self, ping_type, key, session):
		if ping_type in ['conflict_ping','cr_fail_ping','uct_fail_ping','qa_fail_ping']:
			row = session.query(Tickets).filter(Tickets.key == key).first()
			row.pcr_ping = 0
			row.merge_ping = 0
			row.conflict_ping = 0
			row.qa_ping = 0
			row.uct_fail_ping = 0
			row.cr_fail_ping = 0
			row.uct_ping = 0
			row.qa_fail_ping = 0
			return session.commit()

	def get_ping(self, field, key, session):
		row = session.query(Tickets).filter(Tickets.key == key).first()
		if row:
			return getattr(row, field)
		else:
			return 0

	def get_pings(self, key, session):
		return session.query(Tickets).filter(Tickets.key == key).first()

	def row2dict(self, row):
		d = {}
		for column in row.__table__.columns:
			d[column.name] = getattr(row, column.name)
		return d
