#!/usr/bin/python3

from .CodeCloudAPI import CodeCloudAPI
from .Git import Git

class Crucible(Git):
    def __init__(self):
        self.code_cloud_api = CodeCloudAPI()
        Git.__init__(self, self.code_cloud_api)
