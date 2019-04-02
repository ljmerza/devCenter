"""All SQL models."""
import datetime 

from sqlalchemy import Column, ForeignKey, DateTime, SMALLINT, Integer
from sqlalchemy.dialects.mysql import VARCHAR, TEXT, CHAR
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship


Modal = declarative_base()


class Tickets(Modal):
	"""Tickets table."""

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
	"""Comments table."""

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
	"""Errors table."""

	__tablename__ = 'error_logs'
	message = Column(CHAR(255), primary_key=True)
	timestamp = Column(DateTime, default=datetime.datetime.now)


class Users(Modal):
	"""Users table."""

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
	"""NavBar table."""

	__tablename__ = 'navbar_items'
	id = Column(Integer, primary_key=True)
	type = Column(VARCHAR(30))
	link = Column(VARCHAR(100))
	name = Column(VARCHAR(30))


class JqlLinks(Modal):
	"""JQL Links table."""

	__tablename__ = 'jqls'
	id = Column(Integer, primary_key=True)
	name = Column(VARCHAR(50))
	display_name = Column(VARCHAR(50))
	query = Column(TEXT(charset='utf8'))
	add_projects = Column(SMALLINT)
	order_on_list = Column(SMALLINT)
	submenu = Column(VARCHAR(50))


class Repos(Modal):
	"""Repos table."""

	__tablename__ = 'repos'
	id = Column(Integer, primary_key=True)
	name = Column(VARCHAR(30))


class OrderItems(Modal):
	"""Orders table."""

	__tablename__ = 'TICKETTOOL_WORKLISTFIELDS_ODB'
	id = Column(Integer, primary_key=True)
	odbFieldName = Column(VARCHAR(125))
	displayName = Column(VARCHAR(125))
	mandatory = Column(SMALLINT)
	columnWidth = Column(VARCHAR(7))
	defaultFields = Column(VARCHAR(11))
	dataType = Column(VARCHAR(20))


class Statuses(Modal):
	"""Ticket Status table."""

	__tablename__ = 'statuses'
	id = Column(Integer, primary_key=True)
	team_id = Column(Integer)
	status_name = Column(VARCHAR(50))
	status_code = Column(VARCHAR(50))
	transitions = Column(VARCHAR(50))
	constant = Column(VARCHAR(20))
	color = Column(VARCHAR(20))
	auto_transition = Column(SMALLINT)
	transition_id = Column(VARCHAR(7))
	is_component = Column(SMALLINT)


class TicketHistory(Modal):
	"""Ticket History table."""

	__tablename__ = 'ticket_history'
	key = Column(VARCHAR(30), primary_key=True)
	assignee = Column(VARCHAR(30))
	time_tracking = Column(TEXT(charset='utf8'))
	changelog = Column(TEXT(charset='utf8'))
	fix_version = Column(TEXT(charset='utf8'))
	
class EpicLinks(Modal):
	"""Epic links table."""

	__tablename__ = 'epic_links'
	id = Column(Integer, primary_key=True)
	epic_link = Column(VARCHAR(20))
	epic_word = Column(VARCHAR(20))