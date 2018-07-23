#!/usr/bin/python3

from .CodeCloudAPI import CodeCloudAPI
from .Git import Git
from .Reviewers import Reviewers
from .PullRequests import PullRequests
from .Comments import Comments


class CodeCloud(Git, Reviewers, PullRequests, Comments):
	def __init__(self):
		self.code_cloud_api = CodeCloudAPI()
		
		Git.__init__(self, self.code_cloud_api)
		Reviewers.__init__(self, self.code_cloud_api)
		PullRequests.__init__(self, self.code_cloud_api)
		Comments.__init__(self, self.code_cloud_api)