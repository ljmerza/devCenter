"""Interact with a SQL database."""
import os
import datetime

from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import inspect, create_engine

from .tickets import SQLTickets
from .users import SQLUsers
from .navbar import SQLNavBar
from .statuses import Statuses
from .history import TicketHistory
from .models import ErrorLogs
from .misc import Misc
from .epic_links import EpicLinks

class DevCenterSQL(SQLTickets, SQLUsers, SQLNavBar, Misc, Statuses, TicketHistory, EpicLinks):
	"""Interact with a SQL database."""

	def __init__(self,):
		"""Setup config for SQL database connection."""
		
		SQLTickets.__init__(self)
		SQLUsers.__init__(self)
		SQLNavBar.__init__(self)
		Misc.__init__(self)

		username = os.environ['USER']
		password = os.environ['SQL_PASSWORD']
		host = os.environ['SQL_HOST']
		SQL_ECHO  = os.environ['SQL_ECHO']
		DB_TABLE  = os.environ['DB_TABLE']

		url = f'mysql+pymysql://{username}:{password}@{host}:3306/{DB_TABLE}?charset=utf8'
		self.engine = create_engine(url, echo=SQL_ECHO, pool_size=20)

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
