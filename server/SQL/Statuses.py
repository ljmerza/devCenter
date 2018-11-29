#!/usr/bin/python3

from .SQLModels import Statuses as StatusModel

class Statuses():
	def __init__(self, project_managers):
		self.project_managers = project_managers

	def get_statuses(self):

		session = self.login()
		items = session.query(StatusModel)

		statuses = []
		for item in items:
			statuses.append( self.row2dict(item) )

		self.logout(session)
		return statuses

        