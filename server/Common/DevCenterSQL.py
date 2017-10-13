#!/usr/bin/python3

import re
import os

import SQLModels

from sqlalchemy.ext.compiler import compiles
from sqlalchemy.sql.expression import Insert
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.engine.url import URL
from sqlalchemy import inspect, create_engine



class DevCenterSQL():
	def __init__(self):
		'''gets parameters from ENV and creates DevCenterSQL object

		Args:
			None

		Returns:
			MySQL object
		'''
		pm1 = os.environ['PM1']
		pm2 = os.environ['PM2']
		self.project_managers = [pm1, pm2]

	def login(self):
		'''logs into the SQL DB and creates a connection property on the instance

		Args:
			None
		
		Returns:
			None
		'''

		connect_options = {'drivername': 'mysql+pymysql',
			'username': os.environ['USER'],
			'password': os.environ['SQL_PASSWORD'],
			'host': os.environ['DEV_SERVER'],
			'port': 3306,
			'database': 'dev_center'
		}

		# create SQL engine and inspector
		engine = create_engine(URL(**connect_options))
		self.inspector = inspect(engine)
		# create DB session
		Session = sessionmaker()
		Session.configure(bind=engine)
		self.session = Session()	

	def logout(self):
		'''closes the DB connection

		Args:
			None

		Returns:
			None
		'''
		if self.session:
			self.session.close()

	def add_crucible(self, key, crucible_id):
		'''adds a cricuble key to a Jira row

		Args:
			key (str) the Jira key to associate the Crucible review with
			crucible_id (str) the Crucible ID to to add to the Jira issue

		Returns:
			the SQL execution result
		'''
		try:
			row = self.session.query(SQLModels.Tickets).filter(SQLModels.Tickets.key == key).first()
			row.crucible_id = crucible_id
			return self.session.commit()
		except SQLAlchemyError as e:
			return self.log_error(message=e)

	def update_ticket(self, jira_ticket):
		'''inserts a Jira ticket's key, username, and MSRP values in the DB 
		unless it already exist then updates these values.

		Args:
			jira_ticket (dict) a formatted Jira ticket object

		Returns:
			the SQL response from inserting/updating the DB
		'''
		try:
			row = SQLModels.Tickets(**jira_ticket)
			self.session.add(row)
			return self.session.commit()
		except SQLAlchemyError as e:
		    return self.log_error(message=e)

	def add_jira_comments(self, key, comments):
		'''add a Jira ticket's comments to the DB

		Args:
			key (dict) a formatted Jira ticket object
			comments (list) list of comment object with properties:
				text (str) the comment text
				id (str) the unique comment id

		Returns:
			the SQL response from inserting/updating the DB
		'''

		# for each comment in a Jira ticket add to DB
		for comment in comments:
			comment_obj = {'comment':comment['text'], 'id':comment['id'], 'key':key}
			try:
				row = SQLModels.Comments(**comment_obj)
				self.session.add(row)
				return self.session.commit()
			except SQLAlchemyError as e:
			    return self.log_error(message=e)

	def update_ping(self, field, key, value=0):
		'''updates a ping field for a Jira ticket

		Args:
			field (str) the field name to update
			key (str) the key of the Jira ticket to update
			value (int) the value to update the fields to (default 0)

		Returns:
			the SQL response from updating the DB
		'''
		try:
			row = self.session.query(SQLModels.Tickets).filter(SQLModels.Tickets.key == key).first()
			row[field] = value
			return self.session.commit()
		except SQLAlchemyError as e:
			return self.log_error(message=e)
				
	def get_user_ping_value(self, username, field):
		'''get a user's ping value for a particular field type

		Args:
			field (str) the field name to get the value of
			username (str) the username of the Jira ticket

		Returns:
			2 if project manager or usernmae not assigned
			1 if user wants ping 
			0 if user does not want ping
		'''
		# if ticket is assigned to pm then ignore
		# if a pm or not assigned yet return 2
		if(username in self.project_managers or not username):
			return 2
		else:
			# else get user setting and return it
			row = self.session.query(SQLModels.Tickets).filter(SQLModels.Tickets.username == username).first()
			return row[field]

	def reset_pings(self, ping_type, key):
		'''resets all pings of any kind of failed status

		Args:
			ping_type (str) the type of ping that we are resetting
			key (str) the key of the Jira ticket

		Returns:
			The response from the SQL query execution
		''' 
		if ping_type in ['conflict_ping','cr_fail_ping','uct_fail_ping','qa_fail_ping']:
			try:
				row = self.session.query(SQLModels.Tickets).filter(SQLModels.Tickets.key == key).first()
				row.pcr_ping = 0
				row.merge_ping = 0
				row.conflict_ping = 0
				row.qa_ping = 0
				row.uct_fail_ping = 0
				row.cr_fail_ping = 0
				row.uct_ping = 0
				row.qa_fail_ping = 0
				return self.session.commit()
			except SQLAlchemyError as e:
				self.log_error(message=e)

	def get_ping(self, field, key):
		'''gets a Jira ticket's ping settings

		Args:
			field (str) the field name in the DB
			key (str) the key of the Jira ticket

		Returns:
			None
		'''
		row = self.session.query(SQLModels.Tickets).filter(SQLModels.Tickets.key == key).first()
		return row[field]

	def get_pings(self, key):
		'''gets a Jira ticket's ping settings

		Args:
			key (str) the key of the Jira ticket

		Returns:
			None
		'''
		return self.session.query(SQLModels.Tickets).filter(SQLModels.Tickets.key == key).first()


	def log_error(self, message):
		'''logs an error message in the DB. If message already exist then just replaces it
			to avoid duplicate entries

		Args:
			message (str) the message to add to the log

		Returns:
			The response from the SQL query execution
		'''

		# if error logging dies then we just die
		row = SQLModels.ErrorLog({'message':message})
		self.session.add(row)
		return self.session.commit()