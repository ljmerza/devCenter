#!/usr/bin/python3

import time
import sys

from CruciblePCR import CruciblePCR
from CrucibleRepoBranch import CrucibleRepoBranch
from CrucibleReviewId import CrucibleReviewId
from CrucibleMisc import CrucibleMisc

from CrucibleAPI import CrucibleAPI


class Crucible(CruciblePCR, CrucibleRepoBranch, CrucibleReviewId, CrucibleMisc):
	'''
	'''

	def __init__(self):
		'''

		Args:
			
			
		Returns:
			
		'''

		self.crucible_api = CrucibleAPI()

		CruciblePCR.__init__(self, self.crucible_api)
		CrucibleRepoBranch.__init__(self, self.crucible_api)
		CrucibleReviewId.__init__(self, self.crucible_api)
		CrucibleMisc.__init__(self, self.crucible_api)


