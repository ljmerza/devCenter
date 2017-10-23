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
	return issue['key']

def get_msrp(issue):
	'''gets an issue's msrp

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue msrp or 0
	'''
	# if exists then return else return 0
	if 'customfield_10212' in issue['fields']:
		return issue['fields']['customfield_10212']
	else:
		return 0

def get_status(issue):
	'''gets an issue's status

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue status or empty string
	'''
	if 'status' in issue['fields']:
		if( ('name' in issue['fields']['status']) and issue['fields']['status']['name'] ):
			return issue['fields']['status']['name']
	else:
		return ''

def get_summary(issue):
	'''gets an issue's summary

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue summary
	'''
	if 'summary' in issue['fields']:
		return issue['fields']['summary']
	else:
		return ''

def get_username(issue):	
	'''gets an issue's username 

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue username or empty string
	'''
	# get username if exists
	if 'assignee' in issue['fields']:
		if issue['fields']['assignee'] and issue['fields']['assignee']['name']:
			return issue['fields']['assignee']['name']
	else:
		return ''

def get_user_details(issue):	
	'''gets a user's details

	Args:
		issue (dict) a Jira issue object

	Returns:
		the username, email, and display name of the user assigned to the Jira ticket
	'''
	user = {}
	if 'assignee' in issue['fields']:
		if issue['fields']['assignee'] and issue['fields']['assignee']['name']:
			user['name'] = issue['fields']['assignee']['name']
		if issue['fields']['assignee'] and issue['fields']['assignee']['emailAddress']:
			user['emailAddress'] = issue['fields']['assignee']['emailAddress']
		if issue['fields']['assignee'] and issue['fields']['assignee']['displayName']:
			user['displayName'] = issue['fields']['assignee']['displayName']
	return user

def get_linked_issues(issue):
	'''gets an issue's linked issues details

	Args:
		issue (dict) a Jira issue object

	Returns:
		a list of linked issues with their key, summary, and status
	'''
	link = []
	if 'issuelinks' in issue['fields']:
		for link in issue['fields']['issuelinks']:
			link.append({
				'key': link['inwardIssue']['key'],
				'summary': link['inwardIssue']['fields']['summary'],
				'status': link['inwardIssue']['fields']['status']['name']
			})

def get_component(issue):
	'''gets an issue's components in a space delimited string

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue's components or empty string
	'''
	all_components = []
	if 'components' in issue['fields']:
		# for each component add to list to join then on return
		for component in issue['fields']['components']:
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
	if 'customfield_10006' in issue['fields']:
		return issue['fields']['customfield_10006']
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
		if 'name' in issue['fields']['fixVersions'][0]:
			sprint = issue['fields']['fixVersions'][0]['name']
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
	if 'customfield_10002' in issue['fields'] and issue['fields']['customfield_10002']:
		epic_link = issue['fields']['customfield_10002']
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
	if 'labels' in issue['fields']:
		return issue['fields']['labels']
	else:
		return ''

def get_comments(issue):
	'''gets an issue's comments array

	Args:
		issue (dict) a Jira issue object

	Returns:
		an array of the issue's comments or empty array
	'''
	comments = []
	if 'comment' in issue['fields']:
		# for each comment save it and see if QA steps
		for comment in issue['fields']['comment']['comments']:
			# save comment
			comments.append({
				'comment': comment['body'],
				'id': comment['id'],
				'key': issue['key'],
				'username': comment['author']['name'],
				'email': comment['author']['emailAddress'],
				'display_name': comment['author']['displayName']
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

def get_customer_details(issue):
	customer = {}
	if 'customfield_10102' in issue['fields']:
		customer['username'] = issue['fields']['customfield_10102']
	if 'customfield_10175' in issue['fields']:
		customer['email'] = issue['fields']['customfield_10175']
	if 'customfield_10103' in issue['fields']:
		customer['display_name'] = issue['fields']['customfield_10103']
	if 'customfield_10602' in issue['fields']:
		customer['phone_number'] = issue['fields']['customfield_10602']
	return customer

def get_severity(issue):
	if 'customfield_10108' in issue['fields']:
		return issue['fields']['customfield_10108']['value']
	else:
		return ''

def get_dates(issue):
	dates = {}
	if 'aggregatetimeestimate' in issue['fields']:
		dates['logged'] = issue['fields']['aggregatetimeestimate']
	if 'aggregatetimeoriginalestimate' in issue['fields']:
		dates['estimate'] = issue['fields']['aggregatetimeoriginalestimate']
	if 'duedate' in issue['fields']:
		dates['duedate'] = issue['fields']['duedate']
	if 'created' in issue['fields']:
		dates['created'] = issue['fields']['created']
	if 'updated' in issue['fields']:
		dates['updated'] = issue['fields']['updated']
	if 'customfield_10109' in issue['fields']:
		dates['started'] = issue['fields']['customfield_10109']
	return dates
