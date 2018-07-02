#!/usr/bin/python3
import os
import datetime

from SQLTickets import SQLTickets
from SQLUsers import SQLUsers
from SQLNavBar import SQLNavBar
import SQLModels

from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import inspect, create_engine

class DevCenterSQL(SQLTickets, SQLUsers, SQLNavBar):

	def __init__(self, devdb, sql_echo):
		'''gets parameters from ENV and creates Session object

		Args:
			None

		Returns:
			MySQL object
		'''
		SQLTickets.__init__(self)
		SQLUsers.__init__(self)
		SQLNavBar.__init__(self)

		self.project_managers = os.environ['PM'].split(',')

		drivername = 'mysql+pymysql'
		username = os.environ['USER']
		password = os.environ['SQL_PASSWORD']
		host = os.environ['SQL_HOST']
		port = 3306

		# default dev DB unless debug false
		database = 'dev_center_dev'
		if not devdb:
			database = 'dev_center'

		charset = 'utf8'
		self.engine = create_engine(f'{drivername}://{username}:{password}@{host}:{port}/{database}?charset={charset}', echo=sql_echo)

	def login(self):
		'''logs into the SQL DB

		Args:
			None
		
		Returns:
			the session
		'''		
		Session = sessionmaker(bind=self.engine, autoflush=False)
		return Session()

	def logout(self, session):
		'''closes the DB connection

		Args:
			session (Session instance) the session to close

		Returns:
			None
		'''
		session.close()

		'''Create Jira class instance

		Args:
			None

		Returns:
			a Jira instance
		'''

	def log_error(self, message):
		'''logs an error message in the DB. If message already exist then just replaces it
			to avoid duplicate entries

		Args:
			message (str) the message to add to the log

		Returns:
			None
		'''
		# try to get existing Jira ticket
		try:
			session = self.login()
			row = session.query(SQLModels.ErrorLogs).filter(SQLModels.ErrorLogs.message == message).first()
			# if existing error doesn't exist then add to DB
			if row is None:
				row = SQLModels.ErrorLogs(message=message)
				session.add(row)
			else:
				row.timestamp = datetime.datetime.now()
			session.commit()
		except SQLAlchemyError as e:
			print('ERROR: COuld not log error: ', message)
			exit(1)
		self.logout(session=session)