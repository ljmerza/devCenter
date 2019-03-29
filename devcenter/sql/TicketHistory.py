#!/usr/bin/python3

from .SQLModels import TicketHistory as TicketHistoryModel

class TicketHistory():

	def get_ticket_history(self):

		session = self.login()
		items = session.query(TicketHistoryModel)

		tickets = []
		for item in items:
			tickets.append( self.row2dict(item) )

		self.logout(session)
		return tickets

        