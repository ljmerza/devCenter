#!/usr/bin/python3

import CrucibleRepoBranch
import os
import base64

divider = '-'*40

username = os.environ['USER']
password = os.environ['PASSWORD']
header_value = f'{username}:{password}'
encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
cred_hash = f'Basic {encoded_header}'
 
crucible_id = 'CR-UD-3633'

crucible = CrucibleRepoBranch.CrucibleRepoBranch()


print('get_branches')
response = crucible.get_branches(repo_name='ud', cred_hash=cred_hash)
print(response)
print(divider)

print('find_branch')
response = crucible.find_branch(repo_name='ud', msrp='110994', cred_hash=cred_hash)
print(response)
print(divider)

print('find_branches')
response = crucible.find_branches(msrp='110994', cred_hash=cred_hash)
print(response)
print(divider)