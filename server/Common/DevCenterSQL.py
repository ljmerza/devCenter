#!/usr/bin/python3

import os
import logging
import sys
import time

from . import SQLModels

from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import inspect, create_engine, or_, and_



class DevCenterSQL():
	def __init__(self):
		'''gets parameters from ENV and creates Session object

		Args:
			None

		Returns:
			MySQL object
		'''
		self.project_managers = os.environ['PM'].split(',')
		self.debug = False

		drivername = 'mysql+pymysql'
		username = os.environ['USER']
		password = os.environ['SQL_PASSWORD']
		host = os.environ['DEV_SERVER']
		port = 3306

		# try to get DB name  (default to dev DB)
		database = 'dev_center_dev'
		try:
			database = os.environ['DC_DB']
		except:
			pass

		charset = 'utf8'

		# create SQL engine and inspector
		engine = create_engine(f'{drivername}://{username}:{password}@{host}:{port}/{database}?charset={charset}', echo=self.debug)
		self.inspector = inspect(engine)
		# create DB session
		self.Session = sessionmaker(bind=engine)

	def login(self):
		'''logs into the SQL DB

		Args:
			None
		
		Returns:
			the session
		'''		
		return self.Session.session()

	def logout(self, session):
		'''closes the DB connection

		Args:
			session (Session instance) the session to close

		Returns:
			None
		'''
		session.close()

	def add_crucible(self, key, crucible_id, session):
		'''adds a cricuble key to a Jira row

		Args:
			key (str) the Jira key to associate the Crucible review with
			crucible_id (str) the Crucible ID to to add to the Jira issue
			session (Session instance) the session to close

		Returns:
			the SQL execution result
		'''
		row = session.query(SQLModels.Tickets).filter(SQLModels.Tickets.key == key).first()
		row.crucible_id = crucible_id
		return session.commit()	

	def set_inactive_tickets(self, jira_tickets, session):
		'''
		'''
		all_inactive_tickets = session.query(SQLModels.Tickets).filter(SQLModels.Tickets.is_active == 1).all()
		for jira_ticket in jira_tickets['data']:
			# remove current ticket from inactive tickets because we know it's still active
			all_inactive_tickets = [ x for x in all_inactive_tickets if x.key != jira_ticket['key'] ]

		for jira_ticket in all_inactive_tickets:
			jira_ticket.is_active = 0
		session.commit()

	def update_ticket(self, jira_ticket, session):
		'''inserts a Jira ticket's key, username, and MSRP values in the DB 
		unless it already exist then updates these values.

		Args:
			jira_ticket (dict) a formatted Jira ticket object
			session (Session instance) the session to close

		Returns:
			the SQL response from inserting/updating the DB
		'''
		# copy comments to sue them later
		comments = jira_ticket['comments'][:]
		# now delete comments to be able to add to Tickets object
		del jira_ticket['comments']

		# temp delete extra fields
		del jira_ticket['customer_details']
		del jira_ticket['dates']

		# set active marker
		jira_ticket['is_active'] = 1

		# try to get existing Jira ticket
		row = session.query(SQLModels.Tickets).filter(SQLModels.Tickets.key == jira_ticket['key']).first()

		# if existing ticket doesn't exist then add to DB
		if row is None:
			row = SQLModels.Tickets(**jira_ticket)
			session.add(row)
		else:
			# else existing ticket exist so update all fields we have
			for key, val in jira_ticket.items():
				setattr(row, key, val)

		# add comments of ticket
		self._update_comments(comments=comments, session=session)
		

	def _update_comments(self, comments, session):
		'''add a Jira ticket's comments to the DB

		Args:
			comments (list) list of comment object with properties:
				text (str) the comment text
				id (str) the unique comment id
				session (Session instance) the session to close

		Returns:
			the SQL response from inserting/updating the DB
		'''

		# for each comment in a Jira ticket add to DB
		for comment in comments:
			row = session.query(SQLModels.Comments).filter(SQLModels.Comments.id == comment['id']).first()

			# if doesn't exsit then add
			if row is None:
				row = SQLModels.Comments(**comment)
				session.add(row)
			else:
				# else comment exists so update
				for key, val in comment.items():
					setattr(row, key, val)

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
		row = session.query(SQLModels.Tickets).filter(SQLModels.Tickets.key == key).first()
		if row:
			setattr(row, field, value)
			return session.commit()
				
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
			row = session.query(SQLModels.Users).filter(SQLModels.Users.username == username).first()
			if row is not None:
				if(getattr(row, field) or row.all_ping):
					return 1
				else:
					return 0
			else:
				row = SQLModels.Users(username=username)
				session.add(row)
				session.commit()
				return 0

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
			row = session.query(SQLModels.Tickets).filter(SQLModels.Tickets.key == key).first()
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
		row = session.query(SQLModels.Tickets).filter(SQLModels.Tickets.key == key).first()
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
		return session.query(SQLModels.Tickets).filter(SQLModels.Tickets.key == key).first()


	def log_error(self, message, session):
		'''logs an error message in the DB. If message already exist then just replaces it
			to avoid duplicate entries

		Args:
			message (str) the message to add to the log
			session (Session instance) the session to close

		Returns:
			The response from the SQL query execution
		'''
		# try to get existing Jira ticket
		try:
			row = session.query(SQLModels.ErrorLogs).filter(SQLModels.ErrorLogs.message == message).first()
			# if existing error doesn't exist then add to DB
			if row is None:
				row = SQLModels.ErrorLogs(message=message)
			return session.commit()
		except SQLAlchemyError as e:
			# if log error causes an exception then just die
			message = sys.exc_info()[0]
			logging.exception(message)
			exit(1)

	def get_tickets(self, type_of_tickets, session, username=''):
		'''gets all tickets of a certain type

		Args:
			type_of_tickets (str) the  type of tickets to get
				pcr_needed, cr_needed, qa_needed, all_my_tickets, my_tickets
			username (str) - if getting all_my_tickets or my_tickets then need username
			session (Session instance) the session to close

		Returns:
			hash with status and a data property of list of ticket objects or error message
		'''
		# get SQLAlchemy search object
		if(type_of_tickets == 'pcr_needed'):
			sql = SQLModels.Tickets.status.like('%PCR - Needed%')
		elif(type_of_tickets == 'cr_needed'):
			sql = SQLModels.Tickets.status.like('%PCR - Completed%')
		elif(type_of_tickets == 'qa_needed'):
			sql = or_( SQLModels.Tickets.status.like('%Ready for QA%'), SQLModels.Tickets.component.like('%\In QA%') )
		elif(type_of_tickets == 'all_my_tickets'):
			sql = SQLModels.Tickets.username.like('%'+username+'%')
		elif(type_of_tickets == 'my_tickets'):
			sql = and_( SQLModels.Tickets.username.like('%'+username+'%'), SQLModels.Tickets.is_active == 1 )
		else:
			sql=''

		# if sql object exists then filter and return results else return false
		if sql:
			rows = session.query(SQLModels.Tickets).filter(sql).all()
			return {'status': True, 'data': rows}
		else:
			return {'status': False, 'data': 'Did not find any tickets in the database'}

	def get_ticket(self, key, session):
		'''gets a Jira ticket from the DB

			Args:
				key (str) the Jira key to get
				session (Session instance) the session to close

			Returns:
				A SQLAlchemy Jira ticket

		'''
		return session.query(SQLModels.ErrorLogs).filter(SQLModels.Tickets.key == key).first()