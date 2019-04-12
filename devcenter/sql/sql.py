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
		SQL_USER = os.environ.get('SQL_USER', '')
		SQL_PASSWORD = os.environ.get('SQL_PASSWORD', '')
		SQL_HOST = os.environ.get('SQL_HOST', '')
		DB_TABLE = os.environ.get('DB_TABLE', '')
		SQL_ECHO = int(os.environ.get('SQL_ECHO', 0))

		SQL_ECHO = True if SQL_ECHO else False

		url = f'mysql+pymysql://{SQL_USER}:{SQL_PASSWORD}@{SQL_HOST}:3306/{DB_TABLE}?charset=utf8'
		self.engine = create_engine(url, echo=SQL_ECHO, pool_size=20)

	def login(self):	
		"""Log into DB session."""
		Session = sessionmaker(bind=self.engine, autoflush=False)
		return Session()

	def logout(self, session):
		"""Logout of DB session."""
		session.close()

	def log_error(self, message):
		"""Lopg an error to the DB."""
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