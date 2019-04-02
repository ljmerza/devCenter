"""Miscellaneous SQL actions."""
from .models import Repos

class Misc():
	"""Miscellaneous SQL actions."""

	def get_repos(self):
		"""Get a list of repos."""
		session = self.login()
		items = session.query(Repos)
		response = []

		for item in items:
			response.append( self.row2dict(item) )

		self.logout(session)
		return response