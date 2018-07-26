#!/usr/bin/python3
from .SQLModels import Repos

class Misc():

	def get_repos(self):
		session = self.login()
		items = session.query(Repos)
		response = []

		for item in items:
			response.append( self.row2dict(item) )

		self.logout(session)
		return response