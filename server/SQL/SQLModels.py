from sqlalchemy import Column, ForeignKey, DateTime, SMALLINT, Integer
from sqlalchemy.dialects.mysql import VARCHAR, TEXT, CHAR
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

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
	label = Column(VARCHAR(50))
	crucible_id = Column(VARCHAR(15))
	qa_steps = Column(TEXT(charset='utf8'))

	customer_details = Column(TEXT(charset='utf8'))
	severity = Column(VARCHAR(30))
	dates = Column(TEXT(charset='utf8'))

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

	is_active = Column(SMALLINT, default=0)
	comments = relationship("Comments", back_populates="tickets")



class Comments(Modal):
	__tablename__ = 'comments'
	key = Column(VARCHAR(15), ForeignKey('tickets.key'))
	id = Column(VARCHAR(15), primary_key=True)
	comment = Column(TEXT(charset='utf8'))
	username = Column(CHAR(6))
	email = Column(VARCHAR(30))
	display_name = Column(VARCHAR(50))
	tickets = relationship("Tickets", back_populates="comments")
	comment_type = Column(VARCHAR(30))
	created = Column(DateTime)
	updated = Column(DateTime)
	visibility = Column(VARCHAR(15))


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
	uct_fail_ping = Column(SMALLINT, default=0)
	merge_ping = Column(SMALLINT, default=0)
	never_ping = Column(SMALLINT, default=0)
	qa_fail_ping = Column(SMALLINT, default=0)

class NavbarItems(Modal):
	__tablename__ = 'navbar_items'
	id = Column(Integer, primary_key=True)
	type = Column(VARCHAR(30))
	link = Column(VARCHAR(50))
	name = Column(VARCHAR(30))
	