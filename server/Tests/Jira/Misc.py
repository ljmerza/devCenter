#!/usr/bin/python3

import os
import base64

from ...Jira.JiraMisc import JiraMisc
from ...Jira.JiraAPI import JiraAPI

username = os.environ['USER']
password = os.environ['PASSWORD']
header_value = f'{username}:{password}'
encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
cred_hash = f'Basic {encoded_header}'

jira_api = JiraAPI()
jira_misc = JiraMisc(jira_api=jira_api)


response = jira_misc.get_active_sprints(cred_hash=cred_hash)
print(response)