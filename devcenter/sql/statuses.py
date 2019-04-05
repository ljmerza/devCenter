"""Actions for statuses in the DB"""
from .models import Statuses as StatusModel
from devcenter.server_utils import row2dict


class Statuses():
	"""Actions for statuses in the DB"""
		
	def get_statuses(self):
		"""Get all status info from DB."""
		session = self.login()
		items = session.query(StatusModel)
		statuses = [row2dict(item) for item in items]
		self.logout(session)
		return statuses

        