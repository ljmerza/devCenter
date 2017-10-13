from sqlalchemy import inspect, Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime 

Modal = declarative_base()

class Tickets(Modal):
	__tablename__ = 'tickets'
	key = Column(String, primary_key=True)
	msrp = Column(Integer)
	username = Column(String)

	summary = Column(String)
	status = Column(String)
	component = Column(String)
	story_point = Column(String)
	sprint = Column(String)
	epic_link = Column(String)
	label = Column(String)
	crucible_id = Column(String)

	pcr_ping = Column(Integer, default=0)
	merge_ping = Column(Integer, default=0)
	conflict_ping = Column(Integer, default=0)
	new_ping = Column(Integer, default=0)
	me_ping = Column(Integer, default=0)
	qa_ping = Column(Integer, default=0)
	uct_fail_ping = Column(Integer, default=0)
	cr_fail_ping = Column(Integer, default=0)
	uct_ping = Column(Integer, default=0)
	qa_fail_ping = Column(Integer, default=0)



class Comments(Modal):
	__tablename__ = 'comments'
	id = Column(String, primary_key=True)
	comment = Column(String)
	key = Column(String, ForeignKey('ticket.key'))


class ErrorLogs(Modal):
	__tablename__ = 'error_logs'
	message = Column(String, primary_key=True)
	timestamp = Column(DateTime, default=datetime.datetime.now)


class Users(Modal):
	__tablename__ = 'users'
	username = Column(String, primary_key=True)
	all_ping = Column(Integer, default=0)
	new_ping = Column(Integer, default=0)
	conflict_ping = Column(Integer, default=0)
	cr_fail_ping = Column(Integer, default=0)
	merge_ping = Column(Integer, default=0)
	never_ping = Column(Integer, default=0)
	