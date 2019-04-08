""""Formats individual Jira ticket fields."""

import re
import os

qa_regex_begin = re.compile(r"h3\. ==== QA Steps ====")
qa_regex_end = re.compile(r"h3\. ===============")
qa_step_regex = re.compile("qa step", flags=re.IGNORECASE)

try:
	code_cloud_api = os.environ['CODE_CLOUD_URL']
except KeyError:
	code_cloud_api = ''


def get_key(issue):
	"""Gets an issue's key."""
	return issue.get('key', '')


def get_msrp(issue):
	"""Gets an issue's msrp."""
	# if exists then return else return 0
	return issue.get('fields', {}).get('customfield_10212', 0)


def get_full_status(issue):
	"""Get all statuses/components name and id."""
	all_components = list(filter(lambda x: x.get('name').upper() != 'BETA',
							issue.get('fields', {}).get('components', [])))

	return {
		'status': issue.get('fields', {}).get('status', {}),
		'components': all_components
	}


def get_status(issue):
	"""Get the combined string status."""
	full_status = get_full_status(issue)
	status = full_status.get('status')

	if len( full_status.get('components') ):
		status = full_status.get('components')[0]

	return status.get('name', '')


def get_summary(issue):
	"""Gets an issue's summary."""
	return issue.get('fields', {}).get('summary', '')


def get_username(issue):	
	"""Gets an issue's username."""
	# get username if exists
	if ('assignee' in issue.get('fields')) and (issue['fields']['assignee'] is not None):
		return issue['fields']['assignee'].get('name', '')
	else:
		return ''


def get_display_name(issue):	
	"""Gets an issue's display name."""
	# get username if exists
	if ('assignee' in issue.get('fields')) and (issue['fields']['assignee'] is not None):
		return issue['fields']['assignee'].get('displayName', '')
	else:
		return ''


def get_user_details(issue):	
	"""Gets a user's details."""
	# try to get name only instead of username with it
	assignee_data = issue.get('fields', {}).get('assignee', {})

	if not assignee_data:
		assignee_data = {
			'name': '',
			'emailAddress': '',
			'displayName': ''
		}

	return {
		'username': assignee_data.get('name', ''),
		'email_address': assignee_data.get('emailAddress', ''),
		'display_name': _get_display_name(assignee_data.get('displayName', ''))
	}


def _get_display_name(display_name):
	"""Get a user's display name."""
	name_only = display_name.split(' (')
	if(len(name_only) == 2):
		display_name = name_only[0]
	return display_name


def get_component(issue):
	"""Gets an issue's components in a space delimited string."""
	all_components = []
	# for each component add to list to join then on return
	for component in issue.get('fields', {}).get('components', []):
		all_components.append(component['name'])
	return ' '.join(all_components)


def get_story_point(issue):
	"""Gets an issue's story points."""
	# if exists then return else return 0
	if 'timeoriginalestimate' in issue['fields']:
		points = issue['fields']['timeoriginalestimate']
		if points is not None:
			return int(points/60/60/8);
		else:
			return 0
	else:
		return 0


def get_sprint(issue):
	"""Gets an issue's sprint."""
	# get sprint
	sprint = ''
	if 'fixVersions' in issue['fields'] and len(issue['fields']['fixVersions']):
			sprint = issue['fields']['fixVersions'][0]['name']
	return sprint


def get_master_branch(sprint, key):
	"""Gets this current release's master branch."""
	key_items = key.split('-')
	return key_items[0] + sprint


def get_epic_link(issue, epic_links):
	"""Gets an issue's epic link in readable format."""
	epic_link_name = issue.get('fields', {}).get('customfield_10002', '')
	return epic_links.get(epic_link_name, '')


def get_label(issue):
	"""Gets an issue's label is string format (concats with a space)."""
	# if exists then return else return empty string
	labels = issue.get('fields', {}).get('labels')
	if labels:
		return ' '.join(labels)
	else:
		''

def get_comments(issue):
	"""Gets an issue's comments array."""
	comments = []
	key = issue.get('key')

	# for each comment save it and see if QA steps
	for index, comment in enumerate(issue.get('renderedFields', {}).get('comment', {}).get('comments', [])):

		# try toget raw comment data
		raw_comments = issue.get('fields', {}).get('comment', {}).get('comments', [])
		if len(raw_comments) > index-1:
			comment['raw_comment'] = raw_comments[index].get('body', '')

		comments.append( format_comment(comment, key) )
	return comments


def format_comment(comment, key):
	"""Format a Jira comment."""
	raw_comment = comment.get('raw_comment', '')
	rendered_comment = comment.get('renderedBody', '')

	if not raw_comment:
		raw_comment = comment.get('body', '')
	if not rendered_comment:
		rendered_comment = comment.get('body', '')

	comment_type = 'info'
	if re.match(qa_step_regex, raw_comment):
		comment['comment_type'] = 'qa_steps'

	return {
		'comment': rendered_comment,
		'raw_comment': raw_comment,
		'id': comment.get('id', ''),
		'key': key,
		'username': comment.get('updateAuthor', {}).get('name', ''),
		'email': comment.get('updateAuthor', {}).get('emailAddress', ''),
		'display_name': comment.get('updateAuthor', {}).get('displayName', ''),
		'comment_type': comment_type,
		'created': comment.get('created', ''),
		'updated': comment.get('updated', ''),
		'isEditing': False,
		'closeText': 'Edit Comment',
		'editId': 'E' + comment.get('id', ''),
		'visibility': 'Developers' if 'visibility' in comment else ''
	}


def get_customer_details(issue):
	"""Gets customer details for a Jira Ticket."""
	return {
		'username': issue.get('fields', {}).get('customfield_10102', ''),
		'email': issue.get('fields', {}).get('customfield_10175', ''),
		'display_name': issue.get('fields', {}).get('customfield_10103', ''),
		'phone_number': issue.get('fields', {}).get('customfield_10602', '')
	}


def get_dates(issue):
	"""Get ticket log dates for a Jira Ticket."""
	return {
		'estimate': issue.get('fields', {}).get('timetracking', {}).get('originalEstimate', ''),
		'estimate_seconds': issue.get('fields', {}).get('timetracking', {}).get('originalEstimateSeconds', ''),
		'logged': issue.get('fields', {}).get('timetracking', {}).get('timeSpent', ''),
		'logged_seconds': issue.get('fields', {}).get('timetracking', {}).get('timeSpentSeconds', 0),
		'duedate': issue.get('fields', {}).get('duedate', ''),
		'created': issue.get('fields', {}).get('created', ''),
		'updated': issue.get('fields', {}).get('updated', ''),
		'started': issue.get('fields', {}).get('customfield_10109', '')
	}


def get_worklog(issue):
	"""Get worklog data for a Jira Ticket."""
	worklogs = []
	worklog_field = issue.get('fields', {}).get('worklog', False)

	if worklog_field:
		worklogs = worklog_field.get('worklogs', [])

	return worklogs


def get_attachments(issue):
	"""Get all adttachments for a Jira ticket."""
	attachments = []

	if 'attachment' in issue['fields']:
		for attachment in issue['fields']['attachment']:
			attachments.append({
				'filename': attachment['filename'],
				'link': attachment['content']
			})

	return attachments


def get_watchers(issue):
	"""Find all watchers for a Jira ticket."""
	watchers = []
	if 'customfield_10300' in issue['fields'] and len(issue['fields']['customfield_10300']):
		for watcher in issue['fields']['customfield_10300']:
			watchers.append({
				'username': watcher['name'],
				'displayName': _get_display_name(watcher.get('displayName',''))
			})
	return watchers


def get_priority(issue):
	"""Get a Jira ticket's priority."""
	priority = ''
	if 'priority' in issue['fields']:
		priority = issue['fields']['priority'].get('name', '')
	return priority


def get_severity(issue):
	"""Get the severity of a Jira ticket."""
	severity = ''
	if 'customfield_10108' in issue['fields']:
		severity = issue['fields']['customfield_10108'].get('value', '')
	return severity


def get_code_reviewer(issue):
	"""Find the code reviewer of a Jira ticket."""
	code_reviewer = {
		'username': '',
		'displayName': ''
	}

	if 'customfield_10812' in issue['fields'] and issue['fields']['customfield_10812'] is not None:
		code_reviewer = {
			'username': issue['fields']['customfield_10812'].get('name', ''),
			'displayName': _get_display_name(issue['fields']['customfield_10812'].get('displayName',''))
		}
	return code_reviewer


def get_issue_type(issue):
	"""Get issue type of a Jira ticket."""
	issue_type = ''
	if 'issuetype' in issue['fields'] and issue['fields']['issuetype'] is not None:
		issue_type = issue['fields']['issuetype'].get('name', '')
	return issue_type


def get_environment(issue):
	"""Get the environment of a Jira ticket."""
	return issue['fields'].get('environment', '')


def get_dev_changes(issue):
	"""Get the dev changes summary of a Jira ticket."""
	return issue['fields'].get('customfield_10138', '')


def get_issue_links(issue):
	"""Get the linked issues of a Jira ticket."""
	return issue['fields'].get('issuelinks',[])


def get_description(issue):
	"""Get the description of a Jira ticket."""
	return issue['fields'].get('description', '')


def get_history(issue):
	"""Get the change history of a Jira ticket."""
	histories = issue.get('changelog', {}).get('histories', [])
	
	formatted_history = {
		'status': []
	}
	for history in histories:
		items = history.get('items')
		status = items[0].get('field')
		if len(items) and status in ['status', 'Component']:
				formatted_history['status'].append(history)

	# sort by created date
	formatted_history['status'] = sorted(formatted_history['status'], key=lambda k: k['created']) 
	return formatted_history


def get_transitions(issue):
	"""Get all transitions for an issue."""
	transitions = issue.get('transitions', [])
	return [
		{
			'name': transition.get('name', ''),
			'id': transition.get('id', ''),
		}
		for transition in transitions
	]
