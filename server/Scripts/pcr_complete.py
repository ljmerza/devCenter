import sys
import base64
import os

sys.path.append('..')

from Crucible.Crucible import Crucible
from Jira.Jira import Jira

key = 'UD-6201'


# create auth header
username = os.environ['USER']
password = os.environ['PASSWORD']
header_value = f'{username}:{password}'
encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
cred_hash = f'Basic {encoded_header}'

jira = Jira()
cru = Crucible()

crucible_id = cru.get_review_id(key=key, cred_hash=cred_hash)
print(crucible_id)

if crucible_id['status']:
	add_reviewer = cru.add_reviewer(username='lm240n', crucible_id=crucible_id['data'], cred_hash=cred_hash)
	complete_review=cru.complete_review(crucible_id=crucible_id['data'], cred_hash=cred_hash)
	add_pcr_pass=cru.add_pcr_pass(crucible_id=crucible_id['data'], cred_hash=cred_hash)
	number_of_passes = cru.get_pcr_pass(crucible_id=crucible_id['data'], cred_hash=cred_hash)
	print('number_of_passes:', number_of_passes)

	
	jira.set_pcr_complete(key=key, cred_hash=cred_hash)
else:
	print('no crucible id found')


