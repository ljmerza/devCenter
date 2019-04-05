"""Interacts with Jira API."""
from .api import JiraAPI
from .comments import JiraComments
from .component import JiraComponent
from .misc import JiraMisc
from .status import JiraStatus
from .tickets import JiraTickets
from .watchers import JiraWatchers


class Jira(JiraComponent, JiraStatus, JiraMisc, JiraTickets, JiraComments, JiraWatchers):
	"""Interact with the Jira API."""
	
	def __init__(self):
		"""Setup the Jira submodules."""
		self.jira_api = JiraAPI()
		JiraTickets.__init__(self)