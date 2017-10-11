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
	if issue['fields']['customfield_10212']:
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
	return issue['fields']['summary']

def get_username(issue):	
	'''gets an issue's username 

	Args:
		issue (dict) a Jira issue object

	Returns:
		the issue username or empty string
	'''
	# get username if exists
	if issue['fields']['assignee'] and issue['fields']['assignee']['name']:
		return issue['fields']['assignee']['name']
	else:
		return ''

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
	if issue['fields']['customfield_10006']:
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
	if 'customfield_10001' in issue['fields'] and issue['fields']['customfield_10001']:
		sprint_split = issue['fields']['customfield_10001'][0].split(',')
		if len(sprint_split) > 3:
			sprint_split = sprint_split[3].split('=')
			if len(sprint_split) > 1:
				sprint = sprint_split[1]
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
	if issue['fields']['comment']:
		# for each comment save it and see if QA steps
		for comment in issue['fields']['comment']['comments']:
			# save comment
			comments.append(comment['body'])
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
		result = re.split(qa_regex_begin, comment)
		# if we found beginning of QA then let's find end
		if len(result) > 1:
			result = re.split(qa_regex_end, str(result[1]))
			# if found end of QA then we've found QA
			if len(result) > 1:
				issue_qa_step = result[0]
	return issue_qa_step
