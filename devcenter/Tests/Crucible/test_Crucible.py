#!/usr/bin/python3

import os
import base64

import Crucible

divider = '-'*40

username = os.environ['USER']
password = os.environ['PASSWORD']
header_value = f'{username}:{password}'
encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
cred_hash = f'Basic {encoded_header}'


crucible = Crucible.Crucible()
msrp = '112271'
key = 'TEAMDB-416'

issues = {}
issues['data'] = [
	{
		'key': 'UD-6370',
		'fields': {
			'customfield_10212': '110286'
		}
	},
	{
		'key': 'UD-6370',
		'fields': {
			'customfield_10212': '110994'
		}
	},
	{
		'key': 'UD-9999',
		'fields': {
			'customfield_10212': '999999'
		}
	}
]

keys = ['UD-6370','UD-6370','UD-9999']

data = {
	'username': username,
	'title': 'TEST TITLE',
	'repos': [
		{
			'baseBranch': 	f'{username}-110976-Order-view-Bring-in-circuit-history',
			'repositoryName': 'ud_ember',
			'reviewedBranch': 'UD8.20'
		},
		{
			'baseBranch': f'{username}-110976-Order-view-Bring-in-circuit-history',
			'repositoryName': 'ud_api',
			'reviewedBranch': 'UD8.20' 
		}
	]
}

print('get_review_id')
response = crucible.get_review_id(key=key, msrp=msrp, cred_hash=cred_hash)
print(response)
response = crucible.get_review_id(key=key, cred_hash=cred_hash)
print(response)
response = crucible.get_review_id(msrp=msrp, cred_hash=cred_hash)
print(response)
response = crucible.get_review_id(msrp='99999', key='QWE-2345', cred_hash=cred_hash)
print(response)
print(divider)

print('create_crucible')
response = crucible.create_crucible(data=data, cred_hash=cred_hash)
print(response)
print(divider)

crucible_id = response['data']

print('close_crucible')
response = crucible.close_crucible(crucible_id=crucible_id, cred_hash=cred_hash)
print(response)
print(divider)



# print('_get_review_id')
# response = crucible._get_review_id(key=key, msrp=msrp, reviews=reviews, cred_hash=cred_hash)
# print(response)
# print(divider)

# print('get_14_day_reviews')
# response = crucible.get_14_day_reviews(cred_hash=cred_hash)
# print(response)
# print(divider)

# print('get_reviews')
# response = crucible.get_reviews(days=1, cred_hash=cred_hash)
# print(response)
# print(divider)