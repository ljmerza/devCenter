import re

qa_regex_begin = re.compile(r"h2\. ============================ QA Steps ============================")
qa_regex_end = re.compile(r"h2\. =================================================================")

def get_key(issue):
	return issue['key']

def get_msrp(issue):
	# if exists then return else return 0
	if issue['fields']['customfield_10212']:
		return issue['fields']['customfield_10212']
	else:
		return 0

def get_status(issue):
	return issue['fields']['status']['name']

def get_summary(issue):
	return issue['fields']['summary']

def get_attuid(issue):	
	# get attuid if exists
	if issue['fields']['assignee']:
		attuid = issue['fields']['assignee']['name']
		if attuid:
			return attuid
		else:
			return ''
	else:
		return ''

def get_component(issue):
	all_components = []
	if issue['fields']['components']:
		# for each component add to list to join then on return
		for component in issue['fields']['components']:
			all_components.append(component['name'])
	return ' '.join(all_components)

def get_story_points(issue):
	# if exists then return else return 0
	if issue['fields']['customfield_10006']:
		return issue['fields']['customfield_10006']
	else:
		return 0

def get_sprint(issue):
	# get sprint
	sprint = ''
	if issue['fields']['customfield_10001']:
		sprint_split = issue['fields']['customfield_10001'][0].split(',')
		if len(sprint_split) > 3:
			sprint_split = sprint_split[3].split('=')
			if len(sprint_split) > 1:
				sprint = sprint_split[1]
	return sprint

def get_epic_link(issue):
	# get epic link
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
	else:
		epic_link = ''
	# return epic link found
	return epic_link

def get_label(issue):
	# if exists then return else return empty string
	if issue['fields']['labels']:
		return issue['fields']['labels']
	else:
		return ''

def get_comments(issue):
	# get comments and QA steps
	comments = []
	if issue['fields']['comment']:
		missing_qa_step = ''
		found_qa = False
		# for each comment save it and see if QA steps
		for comment in issue['fields']['comment']['comments']:
			# save comment
			comments.append(comment['body'])
	return comments

def get_qa_steps(issue):
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
