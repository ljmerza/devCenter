"""Miscellaneous SQL actions."""
from .models import Repos
from devcenter.server_utils import row2dict


class Misc():
	"""Miscellaneous SQL actions."""

	def get_repos(self):
		"""Get a list of repos."""
		session = self.login()
		items = session.query(Repos)
		response = [row2dict(item) for item in items]

		self.logout(session)
		return response