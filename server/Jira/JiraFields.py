import re

qa_regex_begin = re.compile(r"h2\. ============================ QA Steps ============================")
qa_regex_end = re.compile(r"h2\. =================================================================")


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
	return issue.get('fields', {}).get('status', {}).get('name', '')

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

def get_user_details(issue):	
	'''gets a user's details

	Args:
		issue (dict) a Jira issue object

	Returns:
		the username, email, and display name of the user assigned to the Jira ticket
	'''
	return {
		'username': issue.get('fields', {}).get('assignee', {}).get('name', ''),
		'emailAddress': issue.get('fields', {}).get('assignee', {}).get('emailAddress', ''),
		'displayName': issue.get('fields', {}).get('assignee', {}).get('displayName', '')
	}

def get_linked_issues(issue):
	'''gets an issue's linked issues details

	Args:
		issue (dict) a Jira issue object

	Returns:
		a list of linked issues with their key, summary, and status
	'''
	link = []
	for link in issue.get('fields', {}).get('issuelinks', []):
		link.append({
			'key': link.get('inwardIssue', {}).get('key', ''),
			'summary': link.get('inwardIssue', {}).get('fields', {}).get('summary', ''),
			'status': link.get('inwardIssue', {}).get('fields', {}).get('status', {}).get('name', '')
		})
	return link

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
	return issue.get('fields', {}).get('customfield_10006', 0)

def get_sprint(issue):
	'''gets an issue's sprint

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue's sprint or empty string
	'''
	# get sprint
	sprint = ''
	if len( issue.get('fields', {}).get('fixVersions', []) ):
			sprint = issue.get('fields', {}).get('fixVersions')[0].get('name', '')
	return sprint

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
	'''gets an issue's label

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue's label or empty string
	'''
	# if exists then return else return empty string
	return issue.get('fields', {}).get('labels', '')

def get_comments(issue):
	'''gets an issue's comments array

	Args:
		issue (dict) a Jira issue object

	Returns:
		an array of the issue's comments or empty array
	'''
	comments = []
	# for each comment save it and see if QA steps
	for comment in issue.get('fields', {}).get('comment', {}).get('comments', []):
		# save comment
		comments.append({
			'comment': comment.get('body', ''),
			'id': comment.get('id', ''),
			'key': issue.get('key', ''),
			'username': comment.get('author', {}).get('name', ''),
			'email': comment.get('author', {}).get('emailAddress', ''),
			'display_name': comment.get('author', {}).get('displayName', '')
		})
	return comments

def get_qa_steps(issue):
	'''finds an issue's QA steps in the comments if they exist
	
	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue's QA steps or empty string
	'''
	issue_qa_step = ''
	# get all comments
	comments = get_comments(issue)
	# for each comment see if is qa step
	for comment in comments:
		# test if qa step begin exists
		result = re.split(qa_regex_begin, comment['comment'])
		# if we found beginning of QA then let's find end
		if len(result) > 1:
			result = re.split(qa_regex_end, str(result[1]))
			# if found end of QA then we've found QA
			if len(result) > 1:
				issue_qa_step = result[0]
	return issue_qa_step

def get_crucible_id(issue):
	'''finds an issue's crucible id through the comments
	
	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue's crucible ID or an empty string
	'''
	crucible_id = ''
	# get all comments
	comments = get_comments(issue)
	# print(comments)
	# for each comment see if has crucible id
	for comment in comments:
		# try to pull out Crucible ID and if we have a match then save it
		match = re.search(r'CR-UD-[0-9]{4}', comment['comment'])
		if match:
			crucible_id = match.group(0)
	# return our results
	return crucible_id

def get_customer_details(issue):
	'''gets an issue's customer info

	Args:
		issue (dict) a Jira issue object

	Returns:
		dict with the following properties (with a value or empty string):
			username (str) the username of the customer
			email (str) the email of the customer
			display_name (str) the full name of the customer
			phone_number (str) the phone number of the customer
	'''
	return {
		'username': issue.get('fields', {}).get('customfield_10102', ''),
		'email': issue.get('fields', {}).get('customfield_10175', ''),
		'display_name': issue.get('fields', {}).get('customfield_10103', ''),
		'phone_number': issue.get('fields', {}).get('customfield_10602', '')
	}

def get_severity(issue):
	'''gets an issue's severity

	Args:
		issue (dict) a Jira issue object

	Returns:
		the severity or an empty string
	'''
	return issue.get('fields', {}).get('customfield_10108', {}).get('value', '')

def get_dates(issue):
	'''gets an issue's dates

	Args:
		issue (dict) a Jira issue object

	Returns:
		dict with the following properties (with a value or empty string):
			estimate (str) the time given to finish the ticket
			logged (str) time logged on the ticket
			duedate (str) epoch due date of ticket 
			created (str) epoch when ticket created
			updated (str) epoch last when ticket was updated
			started (str) epoch when ticket was started
	'''
	return {
		'estimate': issue.get('fields', {}).get('timetracking', {}).get('originalEstimate', ''),
		'logged': issue.get('fields', {}).get('timetracking', {}).get('timeSpent', ''),
		'duedate': issue.get('fields', {}).get('duedate', ''),
		'created': issue.get('fields', {}).get('created', ''),
		'updated': issue.get('fields', {}).get('updated', ''),
		'started': issue.get('fields', {}).get('customfield_10109', '')
	}
