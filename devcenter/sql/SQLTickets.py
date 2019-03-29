#!/usr/bin/python3

from sqlalchemy import or_, and_
from .SQLModels import Tickets, ErrorLogs

class SQLTickets():

	def set_inactive_tickets(self, jira_tickets):
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