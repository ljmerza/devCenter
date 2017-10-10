#!/usr/bin/python3

import CruciblePCR
import os
import base64

divider = '-'*40

username = os.environ['USER']
password = os.environ['PASSWORD']
header_value = f'{username}:{password}'
encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
cred_hash = f'Basic {encoded_header}'
 
crucible_id = 'CR-UD-3633'

crucible = CruciblePCR.CruciblePCR()

print('add_reviewer')
response = crucible.add_reviewer(username=username, crucible_id=crucible_id, cred_hash=cred_hash)
print(response)
print(divider)

print('add_comment')
response = crucible.add_comment(crucible_id=crucible_id, cred_hash=cred_hash, comment='TEST COMMENT')
print(response)
print(divider)

print('add_pcr_pass')
response = crucible.add_pcr_pass(crucible_id=crucible_id, cred_hash=cred_hash)
print(response)
print(divider)

print('get_comments')
response = crucible.get_comments(crucible_id=crucible_id, cred_hash=cred_hash)
print(response)
print(divider)

print('get_pcr_estimate')
response = crucible.get_pcr_estimate(story_point=1)
print(response)
response = crucible.get_pcr_estimate(story_point=0.25)
print(response)
response = crucible.get_pcr_estimate(story_point=8)
print(response)
response = crucible.get_pcr_estimate(story_point=3)
print(response)
print(divider)

print('get_pcr_pass')
response = crucible.get_pcr_pass(crucible_id=crucible_id, cred_hash=cred_hash)
print(response)
print(divider)

print('complete_review')
response = crucible.complete_review(crucible_id=crucible_id, cred_hash=cred_hash)
print(response)
print(divider)