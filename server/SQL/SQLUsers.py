#!/usr/bin/python3
from SQLModels import *

class SQLUsers():

	def update_ping(self, field, key, session, value=0):
		'''updates a ping field for a Jira ticket

		Args:
			field (str) the field name to update
			key (str) the key of the Jira ticket to update
			value (int) the value to update the fields to (default 0)
			session (Session instance) the session to close

		Returns:
			the SQL response from updating the DB
		'''
		row = session.query(Tickets).filter(Tickets.key == key).first()
		if row:
			setattr(row, field, value)
			session.commit()
			return {'status': True}
		else:
			return {'status': False, 'data': f'DevCenterSQL::update_ping::Could not find key {key} to change {field} to {value}'}

	def get_user_ping_value(self, username, field, session):
		'''get a user's ping value for a particular field type

		Args:
			field (str) the field name to get the value of
			username (str) the username of the Jira ticket
			session (Session instance) the session to close

		Returns:
			2 if project manager or usernmae not assigned
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
		'''
		'''
		# else get user setting and return it
		row = session.query(Users).filter(Users.username == username).first()
		if row is not None:
			return {'status': True, 'data':  self.row2dict(row)}
		else:
			return {'status': False, 'data': row}

	def set_user_ping_value(self, username, field, value, session):
		'''
		'''
		fields = [{'name':field, 'value':value}]
		return set_user_pings(self, username, fields, session)
	
	def set_user_pings(self, username, fields, session):
		'''
		'''
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
		'''resets all pings of any kind of failed status

		Args:
			ping_type (str) the type of ping that we are resetting
			key (str) the key of the Jira ticket
			session (Session instance) the session to close

		Returns:
			The response from the SQL query execution
		''' 
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
		'''gets a Jira ticket's ping settings

		Args:
			field (str) the field name in the DB
			key (str) the key of the Jira ticket
			session (Session instance) the session to close

		Returns:
			None
		'''
		row = session.query(Tickets).filter(Tickets.key == key).first()
		if row:
			return getattr(row, field)
		else:
			return 0

	def get_pings(self, key, session):
		'''gets a Jira ticket's ping settings

		Args:
			key (str) the key of the Jira ticket
			session (Session instance) the session to close

		Returns:
			None
		'''
		return session.query(Tickets).filter(Tickets.key == key).first()

	def row2dict(self, row):
		'''
		'''
		d = {}
		for column in row.__table__.columns:
			d[column.name] = getattr(row, column.name)
		return d