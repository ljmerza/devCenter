"""Actions for a Epic Link in the DB."""
from .models import EpicLinks as EpicLinksModel
from devcenter.server_utils import row2dict


class EpicLinks():
	"""Actions for a Epic Link in the DB."""

	def get_epic_links(self):
		"""Get all epic links."""
		session = self.login()
		items = session.query(EpicLinksModel)

		epic_links = {}
		for item in items:
			row = row2dict(item)
			epic_links[ row['epic_link'] ] = row['epic_word']

		self.logout(session)
		return epic_links