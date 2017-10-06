import crucible
import Jira

key = 'UD-6594'
cred_hash='Basic bG0yNDBuOlN0QHJ3YXJz'

jira = Jira.Jira()
print('jira login status:', jira.login() )

cru = crucible.Crucible()

crucible_id, crucible_link = cru.get_review_id(key=key, cred_hash=cred_hash)

if crucible_id:
	add_reviewer = cru.add_reviewer(attuid='lm240n', crucible_id=crucible_id, cred_hash=cred_hash)
	complete_review=cru.complete_review(crucible_id=crucible_id, cred_hash=cred_hash)
	add_pcr_pass=cru.add_pcr_pass(crucible_id=crucible_id, cred_hash=cred_hash)
	number_of_passes = cru.get_pcr_pass(crucible_id=crucible_id, cred_hash=cred_hash)
	print('number_of_passes:', number_of_passes)
else:
	print('no crucible id found')


jira.set_pcr_complete(key=key, cred_hash=cred_hash)