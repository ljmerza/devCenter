import sys
import base64
import os

sys.path.append('..')
from Crucible import Crucible
from Jira import Jira

key = 'UD-6700'


# create auth header
attuid = os.environ['USER']
password = os.environ['PASSWORD']
header_value = f'{attuid}:{password}'
encoded_header = base64.b64encode( header_value.encode() )
cred_hash = f'Basic {encoded_header}'

jira = Jira.Jira()
cru = Crucible.Crucible()

crucible_id, crucible_link = cru.get_review_id(key=key, cred_hash=cred_hash)
print(crucible_id, crucible_link)
exit()


if crucible_id:
	add_reviewer = cru.add_reviewer(attuid='lm240n', crucible_id=crucible_id, cred_hash=cred_hash)
	complete_review=cru.complete_review(crucible_id=crucible_id, cred_hash=cred_hash)
	add_pcr_pass=cru.add_pcr_pass(crucible_id=crucible_id, cred_hash=cred_hash)
	number_of_passes = cru.get_pcr_pass(crucible_id=crucible_id, cred_hash=cred_hash)
	print('number_of_passes:', number_of_passes)
else:
	print('no crucible id found')


jira.set_pcr_complete(key=key, cred_hash=cred_hash)