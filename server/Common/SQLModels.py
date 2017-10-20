from sqlalchemy import inspect, Column, Integer, ForeignKey, DateTime, SMALLINT
from sqlalchemy.dialects.mysql import VARCHAR, TEXT, CHAR

from sqlalchemy.ext.declarative import declarative_base
import datetime 

Modal = declarative_base()

class Tickets(Modal):
	__tablename__ = 'tickets'
	key = Column(VARCHAR(15), primary_key=True)
	msrp = Column(VARCHAR(6))
	username = Column(CHAR(6))

	summary = Column(VARCHAR(255))
	status = Column(VARCHAR(100))
	component = Column(VARCHAR(255))
	story_point = Column(VARCHAR(5))
	sprint = Column(VARCHAR(30))
	epic_link = Column(VARCHAR(20))
	label = Column(VARCHAR(30))
	crucible_id = Column(VARCHAR(15))
	qa_steps = Column(TEXT(charset='utf8'))

	pcr_ping = Column(SMALLINT, default=0)
	merge_ping = Column(SMALLINT, default=0)
	conflict_ping = Column(SMALLINT, default=0)
	new_ping = Column(SMALLINT, default=0)
	me_ping = Column(SMALLINT, default=0)
	qa_ping = Column(SMALLINT, default=0)
	uct_fail_ping = Column(SMALLINT, default=0)
	cr_fail_ping = Column(SMALLINT, default=0)
	uct_ping = Column(SMALLINT, default=0)
	qa_fail_ping = Column(SMALLINT, default=0)



class Comments(Modal):
	__tablename__ = 'comments'
	key = Column(VARCHAR(15), ForeignKey('tickets.key'))
	id = Column(VARCHAR(15), primary_key=True)
	comment = Column(TEXT(charset='utf8'))


class ErrorLogs(Modal):
	__tablename__ = 'error_logs'
	message = Column(CHAR(255), primary_key=True)
	timestamp = Column(DateTime, default=datetime.datetime.now)


class Users(Modal):
	__tablename__ = 'users'
	username = Column(CHAR(6), primary_key=True)
	all_ping = Column(SMALLINT, default=0)
	new_ping = Column(SMALLINT, default=0)
	conflict_ping = Column(SMALLINT, default=0)
	cr_fail_ping = Column(SMALLINT, default=0)
	merge_ping = Column(SMALLINT, default=0)
	never_ping = Column(SMALLINT, default=0)
	qa_fail_ping = Column(SMALLINT, default=0)
	