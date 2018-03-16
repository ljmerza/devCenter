#!/usr/bin/python3
import os
import datetime

from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import inspect, create_engine

class APISQL():

	def __init__(self):
		'''
		'''

		drivername = 'mysql+pymysql'
		username = os.environ['USER']
		password = os.environ['SQL_PASSWORD']
		host = os.environ['DEV_SERVER']
		port = 3306
		database = 'ud'
		charset = 'utf8'

		# create SQL engine and inspector
		engine = create_engine(f'{drivername}://{username}:{password}@{host}:{port}/{database}?charset={charset}')
		self.inspector = inspect(engine)
		# create DB session
		self.Session = sessionmaker(bind=engine, autoflush=False)


	def login(self):
		'''logs into the SQL DB

		Args:
			None
		
		Returns:
			the session
		'''		
		return self.Session()

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