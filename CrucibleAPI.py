import API
import os

class CrucibleAPI(API.API):

	def __init__(self):
		API.API.__init__(self)
		self.base_url = os.environ['CRUCIBLE_URL']
		self.attuid = os.environ['USER']
		self.password = os.environ['PASSWORD']
		self.review_url = f'{self.base_url}/cru'
				
	def login(self, attuid='', password=''):
		'''log into crucible and save the session'''
		if attuid and password:
			self.attuid = attuid
			self.password = password
		# try to login
		data = dict(username=self.attuid, password=self.password, rememberme='yes', atl_token='c5e90195a93f28f7ecb7363a8c4583b6c28e3ffe')
		response = self.login_data(f'{self.base_url}/login', data=data)
		# check login response
		if response in [200,201]:
			return { "status": True }
		elif response == 403:
			return { "status": False, "message":"Invalid credentials" }
		else:
			return { "status": False, "message":"Unknown error" }