"""Actions for getting ticket history."""
from .models import TicketHistory as TicketHistoryModel
from devcenter.server_utils import row2dict


class TicketHistory():
	"""Actions for getting ticket history."""

	def get_ticket_history(self):
		"""Get ticket history."""
		session = self.login()
		items = session.query(TicketHistoryModel)

		tickets = [row2dict(item) for item in items]
		self.logout(session)
		return tickets

        