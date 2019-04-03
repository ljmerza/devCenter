"""Interacts with Jira API."""
from .api import JiraAPI
from .comments import JiraComments
from .component import JiraComponent
from .misc import JiraMisc
from .status import JiraStatus
from .tickets import JiraTickets
from .watchers import JiraWatchers
from devcenter.sql.sql import DevCenterSQL


class Jira(JiraComponent, JiraStatus, JiraMisc, JiraTickets, JiraComments, JiraWatchers):
	"""Interact with the Jira API."""
	
	def __init__(self):
		"""Setup the Jira submodules."""
		self.jira_api = JiraAPI()

		dcSql = DevCenterSQL()
		self.epic_links = dcSql.get_epic_links()

		JiraComponent.__init__(self, self.jira_api)
		JiraStatus.__init__(self, self.jira_api)
		JiraMisc.__init__(self, self.jira_api)
		JiraTickets.__init__(self, self.jira_api, self.epic_links)
		JiraComments.__init__(self, self.jira_api)
		JiraWatchers.__init__(self, self.jira_api)