import re
import os


class JiraUtils():
	'''jira class using an username and password'''

	def __init__(self):
		self.jira_url = os.environ['JIRA_URL']
		self.crucible_url = os.environ['CRUCIBLE_URL']
		self.ticket_base = f'{self.jira_url}/browse' # the ticket page
		self.review_base = f'{self.crucible_url}/cru/'
		self.dividers = 189 # how long are the dividers in the ascii table
		###############################################################################
		self.qa_begin = "h2. ============================ QA Steps ============================"
		self.qa_end = "h2. ================================================================="
		self.qa_regex_begin = re.compile(r"h2\. ============================ QA Steps ============================")
		self.qa_regex_end = re.compile(r"h2\. =================================================================")
		##############################################################################

	def show_jira_ascii_header(self):
		'''print ASCII header
		Args:
			None

		Returns:
			None
		'''
		# {0:15.15} = use variable 0 ('Key') with 15 preallocated spaces, .15 means slice string after 15 characters
		print('', '-'* self.dividers)
		print(" | {0:10} | {1:7} | {2:20} | {3:22} | {4:50} | {5:52} | {6:6} |".format('Key', 'MSRP', 'Status', 'Component', 'Summary', 'URL', 'username'))
		print('', '-'* self.dividers)


	def show_jira_ascii_footer(self):
		'''print ASCII footer
		Args:
			None
			
		Returns:
			None
		'''
		print('','-'* self.dividers)
		print(" | TOTAL: {0:3.3} ".format(str(self.total_tickets)), " "*(self.dividers-16), "|")
		print('','-'* self.dividers, '\n\n\n')


	def show_jira_ascii(self):
		'''print ASCII of Jira data to console
		Args:
			issues
			
		Returns:
			None
		'''
		# print header
		self.show_jira_ascii_header(issues)

		# for each issue print issue data in body
		for issue in issues:
			print( " | {0:10.10} | {1:7.7} | {2:20.20} | {3:22.22} | {4:50.50} | {5}/{6:15.15} | {7:6.6} |".format(issue['keys'], issue['msrp'], issue['status'], issue['component'], issue['summary'], self.ticket_base, issue['key'], issue['username']))
			# every 4 issues print divider
			if(idx % 4 == 0):
				print('','-'* self.dividers)
		# print footer
		self.show_jira_ascii_footer()

	def generate_username(self, username):
		'''get real username if not working
		Args:
			None
			
		Returns:
			None
		'''
		if(len(username) == 6):
			return username
		else:
			return username[-6:]

	def sort_data_by(self, filter_key):
		'''
		Args:
			None
			
		Returns:
			None
		'''
		all_data = []
		# get all data into dictionary
		for idx, val in enumerate(self.keys):
			all_data_dict = {
				'key': self.keys[idx],
				'msrp': self.msrps[idx],
				'status': self.statuses[idx],
				'component': self.components[idx],
				'summary': self.summaries[idx],
				'username': self.usernames[idx],
				'story_points': self.story_points[idx],
				'sprints': self.sprints[idx],
				'epic_links': self.epic_links[idx],
				'labels': self.labels[idx],
				'qa_steps': self.qa_steps[idx],
				'comments': self.comments[idx],
			}
			all_data.append(all_data_dict)

		# sort data by username
		all_data_sorted = sorted(all_data, key=lambda k: k[filter_key])
		self.reset_data()

		# set all data back into instance's variables
		for idx, val in enumerate(all_data_sorted):
			self.keys.append(all_data_sorted[idx]['key'])
			self.msrps.append(all_data_sorted[idx]['msrp'])
			self.statuses.append(all_data_sorted[idx]['status'])
			self.components.append(all_data_sorted[idx]['component'])
			self.summaries.append(all_data_sorted[idx]['summary'])
			self.usernames.append(all_data_sorted[idx]['username'])
			self.story_points.append(all_data_sorted[idx]['story_points'])
			self.sprints.append(all_data_sorted[idx]['sprints'])
			self.epic_links.append(all_data_sorted[idx]['epic_links'])
			self.labels.append(all_data_sorted[idx]['labels'])
			self.qa_steps.append(all_data_sorted[idx]['qa_steps'])
			self.comments.append(all_data_sorted[idx]['comments'])

	def create_work_book(self):
		'''
		Args:
			None
			
		Returns:
			None
		'''
		try:
			wb = Workbook()
			dest_filename = 'qa_steps.xlsx'
			ws = wb.active
			ws.page_setup.fitToHeight = 1
			ws.page_setup.fitToWidth = 1
			# create workbook headers
			ws.cell(column=1, row=1, value='MSRP Number')
			ws.cell(column=2, row=1, value='Status')
			ws.cell(column=3, row=1, value='Key')
			ws.cell(column=4, row=1, value='Summary')
			ws.cell(column=5, row=1, value='Epic Link')
			ws.cell(column=6, row=1, value='Sprint')
			ws.cell(column=7, row=1, value='Test Steps')
			# format headers
			for letter in 'ABCDEFG':
				ws[letter+'1'].font = Font(bold=True)
			# format cell sizes
			ws.column_dimensions['B'].width = 35
			ws.column_dimensions['C'].width = 15
			ws.column_dimensions['D'].width = 70
			ws.column_dimensions['E'].width = 15
			ws.column_dimensions['F'].width = 15
			ws.column_dimensions['G'].width = 100
			# for each issue if it has QA steps add to workbook
			workbook_index = 2
			for idx, issue in enumerate(self.keys):
				if(self.qa_steps[idx]):
					# format qa steps
					qa_steps = self.format_qa_steps(self.qa_steps[idx])
					# insert row data
					ws.cell(column=1, row=workbook_index, value=self.msrps[idx] )
					ws.cell(column=2, row=workbook_index, value=self.statuses[idx] )
					ws.cell(column=3, row=workbook_index, value='=HYPERLINK("{}", "{}")'.format(self.ticket_base+'/'+self.keys[idx], self.keys[idx]))
					ws.cell(column=4, row=workbook_index, value=self.summaries[idx] )
					ws.cell(column=5, row=workbook_index, value=self.epic_links[idx] )
					ws.cell(column=6, row=workbook_index, value=self.sprints[idx] )
					ws.cell(column=7, row=workbook_index, value=qa_steps )
					# format key links
					ws['C'+str(workbook_index)].font = Font(underline="single", color='FF0645AD')
					# got to next row
					workbook_index = workbook_index + 1    		
			# save workbook
			wb.save(filename = dest_filename)
			print('Workbook saved.')
		except Exception as e:
			print('Could not save workbook:',e)


	def format_qa_steps(self, qa_steps):
		'''
		Args:
			None
			
		Returns:
			None
		'''
		cnt = it.count()
		next(cnt)
		qa_steps = qa_steps.replace('\=','').replace('\\','')
		qa_steps = re.sub(r"# ", lambda x: '{}. '.format(next(cnt)), qa_steps)
		return qa_steps

	
	def generate_qa_template(self, qa_steps, repos, crucible_id):
		'''
		Args:
			None
			
		Returns:
			None
		'''
			repo_table = self.generate_repo_table(repos)
			return """
"""+repo_table+"""


"""+'[Crucible Review|'+review_base+crucible_id+"""]


"""+self.qa_begin+"""

"""+qa_steps+"""

"""+self.qa_end+"""
			"""


	def generate_repo_table(self, repos):
		'''generates the repos table for a Jira comment geiven an array of repos
		Args:
			repos (Array<dict>) an array of repo dicts with: 
				baseBranch (str) the branch you branched from
				repositoryName (str) the repo name
				reviewedBranch (str) the branch to review
		Returns:
			string of a Jita comment table of repos
		'''
		# create table header
		table_data = "|| Repo || Branch || Branched From ||"
		# for each repo create table row
		for repo in repos:
			# get repo data
			baseBranch = repo['baseBranch']
			repositoryName = repo['repositoryName']
			reviewedBranch = repo['reviewedBranch']
			# create new table row
			table_data+="""
|"""+repositoryName+'|'+reviewedBranch+'|'+baseBranch+'|'
		# return table data
		return table_data


	def save_branches(self, branches):
		'''
		Args:
			None
			
		Returns:
			None
		'''
		pass