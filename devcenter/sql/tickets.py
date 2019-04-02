"""Actions for a ticket in the DB."""
from sqlalchemy import or_, and_

from .models import Tickets, ErrorLogs


class SQLTickets():
	"""Actions for a ticket in the DB."""

	def update_ping(self, field, key, value=0):
		"""Update a ticket's ping value."""
		session = self.login()
		response = ''

		row = session.query(Tickets).filter(Tickets.key == key).first()
		if row:
			setattr(row, field, value)
			session.commit()
			response =  {'status': True}
		else:
			response =  {'status': False, 'data': f'DevCenterSQL::update_ping::Could not find key {key} to change {field} to {value}'}

		self.logout(session)
		return response

	def reset_pings(self, ping_type, key):
		"""Rests all ping values for a ticket"""
		if ping_type in ['conflict_ping','cr_fail_ping','uct_fail_ping','qa_fail_ping']:
			session = self.login()
			row = session.query(Tickets).filter(Tickets.key == key).first()

			row.pcr_ping = 0
			row.merge_ping = 0
			row.conflict_ping = 0
			row.qa_ping = 0
			row.uct_fail_ping = 0
			row.cr_fail_ping = 0
			row.uct_ping = 0
			row.qa_fail_ping = 0

			session.commit()
			self.logout(session)

	def set_inactive_tickets(self, jira_tickets):
		"""Set tickets to inactive."""
		session = self.login()
		all_inactive_tickets = session.query(Tickets).filter(Tickets.is_active == 1).all()
		for jira_ticket in jira_tickets['data']:
			# remove current ticket from inactive tickets because we know it's still active
			all_inactive_tickets = [ x for x in all_inactive_tickets if x.key != jira_ticket['key'] ]

		for jira_ticket in all_inactive_tickets:
			jira_ticket.is_active = 0

		session.commit()
		self.logout(session)

	def update_ticket(self, jira_ticket):
		"""Update a ticket's values."""
		session = self.login()
		jira_ticket= {
			'msrp': jira_ticket['msrp'],
			'key': jira_ticket['key'],
			'username': jira_ticket['username'],
			'is_active': 1
		}

		row = session.query(Tickets).filter(Tickets.key == jira_ticket['key']).first()
		if row is None:
			row = Tickets(**jira_ticket)
			session.add(row)
		else:
			for key, val in jira_ticket.items():
				setattr(row, key, val)

		session.commit()
		self.logout(session)

	def get_ping(self, field, key):
		"""Get a ticket's ping value."""
		session = self.login()
		response = 0

		row = session.query(Tickets).filter(Tickets.key == key).first()
		if row:
			response = getattr(row, field)
			
		self.logout(session)
		return response

	def get_pings(self, key):
		"""Get a ticket's ping values."""
		session = self.login()
		response = session.query(Tickets).filter(Tickets.key == key).first()
		self.logout(session)
		return response