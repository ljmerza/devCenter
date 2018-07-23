import os
import base64

from ..CodeCloud.CodeCloud import CodeCloud 

cc = CodeCloud()

username = os.environ['USER']
password = os.environ['PASSWORD']
header_value = f'{username}:{password}'
encoded_header = base64.b64encode( header_value.encode() ).decode('ascii')
cred_hash = f'Basic {encoded_header}'

repo_name = 'ud_api'
pull_request_id = '20'
comment = 'TEST'
msrp = '136372'



response = cc.generate_diff_links(msrp, cred_hash)
print('--generate_diff_links--')
print(response)

################# Comments
# response = cc.add_comment_to_pull_request(repo_name, pull_request_id, comment, cred_hash)
# print('--add_comment_to_pull_request--')
# print(response)

# response = cc.get_activities(repo_name, pull_request_id, cred_hash)
# print('--get_activities--')
# print(response)



################# Reviewers
# response = cc.add_reviewer_to_pull_request(username, repo_name, pull_request_id, cred_hash)
# print('--add_reviewer_to_pull_request--')
# print(response)

# response = cc.pass_pull_request_review(username, repo_name, pull_request_id, cred_hash)
# print('--pass_pull_request_review--')
# print(response)



################# Git
# response = cc.get_repos()
# print('--get_repos--')
# print(response)

# response = cc.find_branch(repo_name, msrp, cred_hash)
# print('--find_branch--')
# print(response)

# response = cc.ticket_branches(msrp, cred_hash)
# print('--ticket_branches--')
# print(response)

# response = cc.get_branches(repo_name, cred_hash)
# print('--get_branches--')
# print(response)

# response = cc.get_commit_ids(key, master_branch, cred_hash)
# print('--get_commit_ids--')
# print(response)

# response = cc._get_commit_id(repo_name, master_branch, key, cred_hash)
# print('--_get_commit_id--')
# print(response)

# response = cc.create_pull_requests(repos, key, msrp, summary, cred_hash, qa_title)
# print('--create_pull_requests--')
# print(response)