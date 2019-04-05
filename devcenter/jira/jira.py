"""Interacts with Jira API."""
from .api import JiraAPI
from .comments import JiraComments
from .component import JiraComponent
from .misc import JiraMisc
from .status import JiraStatus
from .tickets import JiraTickets
from .watchers import JiraWatchers


class Jira(JiraComponent, JiraStatus, JiraMisc, JiraTickets, JiraComments, JiraWatchers):
	"""Wrapper for the Jira API."""
	jira_api = JiraAPI()