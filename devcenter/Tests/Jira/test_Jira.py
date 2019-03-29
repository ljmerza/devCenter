#!/usr/bin/python3

import os
import base64

import sys
sys.path.append('../../Jira')
sys.path.append('../../')

from Jira import Jira

divider = '-'*40

username = os.environ['USER']
password = os.environ['PASSWORD']
header_value = f'{username}:{password}'
encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
cred_hash = f'Basic {encoded_header}'

print(cred_hash)


jira = Jira()

filter_number = '12776'
key = 'TEAMDB-416'
msrp = '100000'
jql='assignee%20%3D%20te1680%20AND%20resolution%20%3D%20unresolved%20ORDER%20BY%20priority%20DESC%2C%20created%20ASC&fields=customfield_10109,status,customfield_10212,summary,assignee,components,timetracking,duedate&filter='

def get_filter_url():
	print('get_filter_url')
	response = jira.get_filter_url(filter_number=filter_number, cred_hash=cred_hash)
	print(response)
	print(divider)

def get_raw_jira_tickets():
	print('get_raw_jira_tickets')
	response = jira.get_raw_jira_tickets(filter_number=filter_number, cred_hash=cred_hash)
	print(response)
	print(divider)
	return response


def get_jira_tickets():
	print('get_jira_tickets')
	response = jira.get_jira_tickets(jql=jql, filter_number=filter_number, cred_hash=cred_hash)
	print(response)
	return response

def find_key_by_msrp():
	print('find_key_by_msrp')
	response = jira.find_key_by_msrp(msrp=msrp, cred_hash=cred_hash)
	print(response)
	print(divider)

def find_crucible_title_data():
	print('find_crucible_title_data')
	response = jira.find_crucible_title_data(msrp=msrp, cred_hash=cred_hash)
	print(response)
	print(divider)

def add_comment():
	print('add_comment')
	response = jira.add_comment(key=key, cred_hash=cred_hash, comment='TEST COMMENT')
	print(response)
	print(divider)







# print('set_in_dev')
# response = jira.set_in_dev()
# print(response)
# print(divider)

# print('set_pcr_needed')
# response = jira.set_pcr_needed()
# print(response)
# print(divider)

# print('set_pcr_complete')
# response = jira.set_pcr_complete()
# print(response)
# print(divider)

# print('set_ready_for_qa')
# response = jira.set_ready_for_qa()
# print(response)
# print(divider)

# print('set_in_qa')
# response = jira.set_in_qa()
# print(response)
# print(divider)

# print('set_qa_fail')
# response = jira.set_qa_fail()
# print(response)
# print(divider)

# print('set_qa_pass')
# response = jira.set_qa_pass()
# print(response)
# print(divider)

# print('set_merge_code')
# response = jira.set_merge_code()
# print(response)
# print(divider)

# print('set_ready_uct')
# response = jira.set_ready_uct()
# print(response)
# print(divider)

# print('set_merge_conflict')
# response = jira.set_merge_conflict()
# print(response)
# print(divider)

# print('set_uct_fail')
# response = jira.set_uct_fail()
# print(response)
# print(divider)

# print('set_ready_release')
# response = jira.set_ready_release()
# print(response)
# print(divider)
