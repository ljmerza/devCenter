
from ..SQL.DevCenterSQL import DevCenterSQL

class Git():
    def __init__(self, code_cloud_api):
        self.code_cloud_api = code_cloud_api

    def get_repos(self, devdb, sql_echo):
        dcSql = DevCenterSQL(devdb=devdb, sql_echo=sql_echo)
        repos = dcSql.get_repos()
        return {'status': True, 'data': repos}

    def find_branch(self, repo_name, msrp, cred_hash):
        '''
        '''
        returned_branches = []
        response = self.get_branches(repo_name=repo_name, cred_hash=cred_hash)
        if not response['status']:
            return response

        for branch_name in response['data']:
            if str(msrp) in branch_name:
                returned_branches.append(branch_name)

        if len(returned_branches) > 0:
            return {'status': True, 'data': returned_branches, 'all': response['data']}
        else:
            return {'status': False, 'data': f'No branches found with MSRP {msrp}'}

    def ticket_branches(self, msrp, cred_hash):
        branches = []

        for repo in self.repos:
            response = self.find_branch(repo_name=repo, msrp=msrp, cred_hash=cred_hash)
            if response['status']:
                branches.append({'repo': repo, 'branches': response['data'], 'all': response['all']})

        if len(branches) > 0:
            return {'status': True, 'data': branches}
        else:
            return {'status': False, 'data': f'No branches found with MSRP {msrp}'}

    def get_branches(self, repo_name, cred_hash):
        branch_names = []

        url = f'{self.code_cloud_api.branch_api}/{repo_name}/branches?start=0&limit=30'
        response = self.code_cloud_api.get(url=url, cred_hash=cred_hash)
        if not response['status']:
            return response
        
        for item in response.get('data', {}).get('values', {}):
            branch_names.append(item.get('displayId', ''))

        return {'status': True, 'data': branch_names}

    def get_commit_ids(self, key, master_branch, cred_hash):
        commit_ids = []

        for repo_name in self.repos:
            response = self._get_commit_id(
                repo_name=repo_name, key=key, cred_hash=cred_hash, master_branch=master_branch)
            if response['status'] and response['data']:
                commit_ids.append({'master_branch': master_branch,
                                  'repo_name': repo_name, 'commit_id': response['data']})

        return {'status': len(commit_ids) > 0, 'data': commit_ids}

    def _get_commit_id(self, repo_name, master_branch, key, cred_hash):
        commit_id = ''

        url = f'{self.code_cloud_api.branch_api}/{repo_name}/commits?until=refs%2Fheads%2F{master_branch}'
        response = self.code_cloud_api.get(url=url, cred_hash=cred_hash)
        
        if not response['status']:
            return response

        for item in response.get('data', {}).get('values', {}):
            message = item.get('message', '')
            if key in message:
                commit_id = item.get('id')
        
        return {'status': True, 'data': commit_id}

    def create_pull_requests(self, repos, key, msrp, summary, cred_hash, qa_title):
        '''submits pull requests for a list of branches
        '''
        response = {'status': True, 'data': []}

        for repo in repos:
            repo_name = repo['repositoryName']
            reviewed_branch = repo['reviewedBranch']
            base_branch = repo['baseBranch']

            json_data = {
                "title": qa_title,
                "description": summary,
                "state": "OPEN",
                "open": True,
                "closed": False,
                "fromRef": {
                    "id": f"refs/heads/{reviewed_branch}",
                    "repository": {
                        "slug": repo_name,
                        "name": None,
                        "project": {
                            "key": self.code_cloud_api.project_name
                        }
                    }
                },
                "toRef": {
                    "id": f"refs/heads/{base_branch}",
                    "repository": {
                        "slug": repo_name,
                        "name": None,
                        "project": {
                            "key": self.code_cloud_api.project_name
                        }
                    }
                },
                "locked": False,
                "reviewers": [],
                "links": {"self":[None]}
            }

            url = f'{self.code_cloud_api.branch_api}/{repo_name}/pull-requests'
            pull_response = self.code_cloud_api.post_json(
                url=url, 
                json_data=json_data, 
                cred_hash=cred_hash
            )

            if not pull_response['status']:
                response['data'].append({
                    'error': pull_response['data']['errors'][0]['message'],
                    'repo': repo_name
                })
            else:
                response['data'].append({
                    'link': pull_response['data']['links']['self'][0]['href'],
                    'repo': repo_name
                })

        return response