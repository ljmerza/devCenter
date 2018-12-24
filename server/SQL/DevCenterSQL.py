#!/usr/bin/python3
import os
import datetime

from .SQLTickets import SQLTickets
from .SQLUsers import SQLUsers
from .SQLNavBar import SQLNavBar
from .Statuses import Statuses
from .TicketHistory import TicketHistory
from .SQLModels import ErrorLogs
from .Misc import Misc

from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import inspect, create_engine

class DevCenterSQL(SQLTickets, SQLUsers, SQLNavBar, Misc, Statuses, TicketHistory):

	def __init__(self, devdb, sql_echo):
		self.project_managers = os.environ['PM'].split(',')
		
		SQLTickets.__init__(self)
		SQLUsers.__init__(self, self.project_managers)
		SQLNavBar.__init__(self)
		Misc.__init__(self)

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
		url = f'{drivername}://{username}:{password}@{host}:{port}/{database}?charset={charset}'
		self.engine = create_engine(url, echo=sql_echo, pool_size=20)

	def login(self):	
		Session = sessionmaker(bind=self.engine, autoflush=False)
		return Session()

	def logout(self, session):
		session.close()

	def log_error(self, message):
		# try to get existing Jira ticket
		try:
			session = self.login()
			row = session.query(ErrorLogs).filter(ErrorLogs.message == message).first()
			# if existing error doesn't exist then add to DB
			if row is None:
				row = ErrorLogs(message=message)
				session.add(row)
			else:
				row.timestamp = datetime.datetime.now()
			session.commit()
		except SQLAlchemyError as e:
			print('ERROR: COuld not log error: ', message)
			exit(1)
		self.logout(session=session)

	def row2dict(self, row):
		d = {}
		for column in row.__table__.columns:
			d[column.name] = str(getattr(row, column.name))
		return d
