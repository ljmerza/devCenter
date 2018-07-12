#!/usr/bin/python3

from JiraComponent import JiraComponent
from JiraComments import JiraComments
from JiraStatus import JiraStatus
from JiraMisc import JiraMisc
from JiraTickets import JiraTickets
from JiraWatchers import JiraWatchers

from JiraAPI import JiraAPI

class Jira(JiraComponent, JiraStatus, JiraMisc, JiraTickets, JiraComments, JiraWatchers):
	def __init__(self):
		self.jira_api = JiraAPI()

		JiraComponent.__init__(self, self.jira_api)
		JiraStatus.__init__(self, self.jira_api)
		JiraMisc.__init__(self, self.jira_api)
		JiraTickets.__init__(self, self.jira_api)
		JiraComments.__init__(self, self.jira_api)
		JiraWatchers.__init__(self, self.jira_api)