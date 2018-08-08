import re
import os

qa_regex_begin = re.compile(r"h3\. ==== QA Steps ====")
qa_regex_end = re.compile(r"h3\. ===============")
qa_step_regex = re.compile("qa step", flags=re.IGNORECASE)
code_cloud_api = os.environ['CODE_CLOUD_URL']

def get_key(issue):
	'''gets an issue's key

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue key
	'''
	return issue.get('key', '')

def get_msrp(issue):
	'''gets an issue's msrp

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue msrp or 0
	'''
	# if exists then return else return 0
	return issue.get('fields', {}).get('customfield_10212', 0)

def get_status(issue):
	'''gets an issue's status

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue status or empty string
	'''
	status = issue.get('fields', {}).get('status', {}).get('name', '')
	all_components = get_component(issue)

	# get components and set status on certain components
	if 'Code Review - Working' in all_components and status == 'Code Review':
		status = 'Code Review - Working'
	elif 'Merge Code' in all_components:
		status = 'Merge Code'
	elif 'PCR - Working' in all_components:
		status = 'PCR - Working'
	elif 'PCR - Needed' in all_components:
		status = 'PCR - Needed'
	elif 'PCR - Completed' in all_components and status == 'Code Review':
		status = 'PCR - Completed'

	# if merge conflict then overwrite everything
	if 'Merge Conflict' in all_components:
		status = 'Merge Conflict'


	return status


def get_summary(issue):
	'''gets an issue's summary

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue summary
	'''
	return issue.get('fields', {}).get('summary', '')

def get_username(issue):	
	'''gets an issue's username 

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue username or empty string
	'''
	# get username if exists
	if ('assignee' in issue.get('fields')) and (issue['fields']['assignee'] is not None):
		return issue['fields']['assignee'].get('name', '')
	else:
		return ''

def get_display_name(issue):	
	'''gets an issue's display name 

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue username or empty string
	'''
	# get username if exists
	if ('assignee' in issue.get('fields')) and (issue['fields']['assignee'] is not None):
		return issue['fields']['assignee'].get('displayName', '')
	else:
		return ''

def get_user_details(issue):	
	'''gets a user's details

	Args:
		issue (dict) a Jira issue object

	Returns:
		the username, email, and display name of the user assigned to the Jira ticket
	'''
	# try to get name only instead of username with it

	assignee_data = issue.get('fields', {}).get('assignee', '')

	if assignee_data is None:
		assignee_data = {}

	# return all data
	return {
		'username': assignee_data.get('name', ''),
		'email_address': assignee_data.get('emailAddress', ''),
		'display_name': _get_display_name(assignee_data.get('displayName', ''))
	}


def _get_display_name(display_name):
	'''
	'''
	name_only = display_name.split(' (')
	if(len(name_only) == 2):
		display_name = name_only[0]
	return display_name

def get_component(issue):
	'''gets an issue's components in a space delimited string

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue's components or empty string
	'''
	all_components = []
	# for each component add to list to join then on return
	for component in issue.get('fields', {}).get('components', []):
		all_components.append(component['name'])
	return ' '.join(all_components)

def get_story_point(issue):
	'''gets an issue's story points

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue's story points or 0
	'''
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
	'''gets an issue's sprint

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue's sprint or empty string
	'''
	# get sprint
	sprint = ''
	if 'fixVersions' in issue['fields'] and len(issue['fields']['fixVersions']):
			sprint = issue['fields']['fixVersions'][0]['name']
	return sprint

def get_master_branch(sprint, key):
	'''gets this current release's master branch
	'''
	key_items = key.split('-')
	if len(key_items) == 2:
		if key_items[0] in ['TEAMDB', 'UD', 'TASKMASTER', 'UPM', 'SASHA', '']:
			return key_items[0] + sprint
	return ''


def get_epic_link(issue):
	'''gets an issue's epic link in readable format

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue's epic link in readable format or empty string
	'''
	epic_link = ''
	# get epic link
	epic_link = issue.get('fields', {}).get('customfield_10002', '')
	if epic_link == 'UD-2421':
		epic_link = 'Apollo'
	elif epic_link == 'UD-1':
		epic_link = 'Gamma'
	elif epic_link == 'UD-3532':
		epic_link = 'Ember Upgrades'
	elif epic_link == 'UD-3':
		epic_link = 'Magellan'
	elif epic_link == 'UD-4714':
		epic_link = 'UTM'
	elif epic_link == 'UD-656':
		epic_link = 'US GCSC'
	# return epic link found
	return epic_link

def get_label(issue):
	'''gets an issue's label is string format (concats with a space)

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue's label or empty string
	'''
	# if exists then return else return empty string
	labels = issue.get('fields', {}).get('labels')
	if labels:
		return ' '.join(labels)
	else:
		''

def get_comments(issue):
	'''gets an issue's comments array

	Args:
		issue (dict) a Jira issue object

	Returns:
		an array of the issue's comments or empty array
	'''
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
	return {
		'username': issue.get('fields', {}).get('customfield_10102', ''),
		'email': issue.get('fields', {}).get('customfield_10175', ''),
		'display_name': issue.get('fields', {}).get('customfield_10103', ''),
		'phone_number': issue.get('fields', {}).get('customfield_10602', '')
	}

def get_dates(issue):
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
	worklogs = []
	worklog_field = issue.get('fields', {}).get('worklog', False)

	if worklog_field:
		worklogs = worklog_field.get('worklogs', [])

	return worklogs


def get_attachments(issue):
	attachments = []

	if 'attachment' in issue['fields']:
		for attachment in issue['fields']['attachment']:
			attachments.append({
				'filename': attachment['filename'],
				'link': attachment['content']
			})

	return attachments


def get_watchers(issue):
	watchers = []
	if 'customfield_10300' in issue['fields'] and len(issue['fields']['customfield_10300']):
		for watcher in issue['fields']['customfield_10300']:
			watchers.append({
				'username': watcher['name'],
				'displayName': _get_display_name(watcher.get('displayName',''))
			})
	return watchers

def get_priority(issue):
	priority = ''
	if 'priority' in issue['fields']:
		priority = issue['fields']['priority'].get('name', '')
	return priority

def get_severity(issue):
	severity = ''
	if 'customfield_10108' in issue['fields']:
		severity = issue['fields']['customfield_10108'].get('value', '')
	return severity

def get_code_reviewer(issue):
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
	issue_type = ''
	if 'issuetype' in issue['fields'] and issue['fields']['issuetype'] is not None:
		issue_type = issue['fields']['issuetype'].get('name', '')
	return issue_type

def get_environment(issue):
	return issue['fields'].get('environment', '')

def get_dev_changes(issue):
	return issue['fields'].get('customfield_10138', '')

def get_issue_links(issue):
	return issue['fields'].get('issuelinks',[])

def get_description(issue):
	return issue['fields'].get('description','')

def get_history(issue):
	histories = issue.get('changelog', {}).get('histories', [])
	
	formatted_history = {
		'status': []
	}
	for history in histories:
		items = history.get('items')
		status = items[0].get('field')
		if len(items) and status in ['status', 'Component'] :
				formatted_history['status'].append(history)

	# sort by created date
	formatted_history['status'] = sorted(formatted_history['status'], key=lambda k: k['created']) 
	return formatted_history