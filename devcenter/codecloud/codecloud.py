"""Wrapper for the code cloud API."""
from .api import CodeCloudAPI
from .git import Git
from .reviewers import Reviewers
from .pull_requests import PullRequests
from .comments import Comments


class CodeCloud(Git, Reviewers, PullRequests, Comments):
	"""Wrapper for the code cloud API."""

	def __init__(self):
		"""Setup the code cloud API."""
		self.code_cloud_api = CodeCloudAPI()
		