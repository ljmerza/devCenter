#!/usr/bin/python3
import sys
sys.path.append('..')

from Crucible import Crucible
from Jira import Jira

crucible = Crucible.Crucible()
jira = Jira.Jira()


def set_pcr_complete(data):
	# check for required data
	if(not 'cred_hash' in data or not 'key' in data):
		return {"response": "Missing required parameters: "+ data, "status": "ERROR"}
	# PCR complete jira ticket
		jira.set_pcr_complete(key=key, cred_hash=cred_hash)
	return {"status": "OK", "number": number_of_passes}