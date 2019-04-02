"""Actions for statuses in the DB"""
from .models import Statuses as StatusModel

class Statuses():
	"""Actions for statuses in the DB"""
		
	def get_statuses(self):
		"""Get all status info from DB."""
		session = self.login()
		items = session.query(StatusModel)

		statuses = []
		for item in items:
			statuses.append( self.row2dict(item) )

		self.logout(session)
		return statuses

        