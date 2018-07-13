#!/usr/bin/python3

from ..FlaskUtils import check_parameters


def get_repos(data, code_cloud_obj):
	return code_cloud_obj.get_repos()


def get_branches(data, code_cloud_obj):
	missing_params = check_parameters(
		params=data, required=['cred_hash', 'repo_name'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	return code_cloud_obj.get_branches(cred_hash=data['cred_hash'], repo_name=data['repo_name'])


def ticket_branches(data, code_cloud_obj):
	missing_params = check_parameters(params=data, required=['cred_hash', 'msrp'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	return code_cloud_obj.ticket_branches(cred_hash=data['cred_hash'], msrp=data['msrp'])


def create_pull_requests(data, code_cloud_obj):
	missing_params = check_parameters(
		params=data, required=['cred_hash', 'repos', 'key', 'msrp', 'summary'])
	if missing_params:
		return {"data": f"Missing required parameters: {missing_params}", "status": False}
	return code_cloud_obj.create_pull_requests(repos=data['repos'], key=data['key'], msrp=data['msrp'], cred_hash=data['cred_hash'], summary=data['summary'])
