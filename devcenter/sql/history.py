"""Actions for getting ticket history."""
from .models import TicketHistory as TicketHistoryModel


class TicketHistory():
	"""Actions for getting ticket history."""

	def get_ticket_history(self):
		"""Get ticket history."""
		session = self.login()
		items = session.query(TicketHistoryModel)

		tickets = []
		for item in items:
			tickets.append( self.row2dict(item) )

		self.logout(session)
		return tickets

        