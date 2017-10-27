#!/usr/bin/python3

import os
import base64

import Jira

divider = '-'*40

username = os.environ['USER']
password = os.environ['PASSWORD']
header_value = f'{username}:{password}'
encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
cred_hash = f'Basic {encoded_header}'


jira = Jira.Jira()

filter_number = '11418'
key = 'TEAMDB-416'
msrp = '100000'

print('get_filter_url')
response = jira.get_filter_url(filter_number=filter_number, cred_hash=cred_hash)
print(response)
print(divider)

print('get_raw_jira_tickets')
response = jira.get_raw_jira_tickets(filter_number=filter_number, cred_hash=cred_hash)
print(response)
response = jira.get_raw_jira_tickets(filter_number=filter_number, cred_hash=cred_hash, max_results=3)
print(response)
response = jira.get_raw_jira_tickets(filter_number=filter_number, cred_hash=cred_hash, start_at=3)
print(response)
print(divider)

print('get_jira_tickets')
response = jira.get_jira_tickets(filter_number=filter_number, cred_hash=cred_hash)
print(response)
response = jira.get_jira_tickets(filter_number=filter_number, cred_hash=cred_hash, max_results=3)
print(response)
response = jira.get_jira_tickets(filter_number=filter_number, cred_hash=cred_hash, start_at=3)
print(response)
print(divider)

print('find_key_by_msrp')
response = jira.find_key_by_msrp(msrp=msrp, cred_hash=cred_hash)
print(response)
print(divider)

print('find_crucible_title_data')
response = jira.find_crucible_title_data(msrp=msrp, cred_hash=cred_hash)
print(response)
print(divider)

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
