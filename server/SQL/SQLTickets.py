#!/usr/bin/python3
from SQLModels import *

class SQLTickets():

	def add_crucible(self, key, crucible_id, session):
		'''adds a cricuble key to a Jira row

		Args:
			key (str) the Jira key to associate the Crucible review with
			crucible_id (str) the Crucible ID to to add to the Jira issue
			session (Session instance) the session to close

		Returns:
			the SQL execution result
		'''
		row = session.query(Tickets).filter(Tickets.key == key).first()
		row.crucible_id = crucible_id
		return session.commit()	

	def set_inactive_tickets(self, jira_tickets, session):
		'''
		'''
		all_inactive_tickets = session.query(Tickets).filter(Tickets.is_active == 1).all()
		for jira_ticket in jira_tickets['data']:
			# remove current ticket from inactive tickets because we know it's still active
			all_inactive_tickets = [ x for x in all_inactive_tickets if x.key != jira_ticket['key'] ]

		for jira_ticket in all_inactive_tickets:
			jira_ticket.is_active = 0
		session.commit()

	def update_ticket(self, jira_ticket, session):
		'''inserts a Jira ticket's key, username, and MSRP values in the DB 
		unless it already exist then updates these values.

		Args:
			jira_ticket (dict) a formatted Jira ticket object
			session (Session instance) the session to close

		Returns:
			the SQL response from inserting/updating the DB
		'''

		jira_ticket= {
			'msrp': jira_ticket['msrp'],
			'key': jira_ticket['key'],
			'username': jira_ticket['username']
		}

		# set active marker
		jira_ticket['is_active'] = 1

		# try to get existing Jira ticket
		row = session.query(Tickets).filter(Tickets.key == jira_ticket['key']).first()
		
		# if existing ticket doesn't exist then add to DB
		if row is None:
			row = Tickets(**jira_ticket)
			session.add(row)
		else:
			# else existing ticket exist so update all fields we have
			for key, val in jira_ticket.items():
				setattr(row, key, val)

		# add comments of ticket and commit
		# self._update_comments(comments=comments, session=session)


		session.commit()
		

	def _update_comments(self, comments, session):
		'''add a Jira ticket's comments to the DB

		Args:
			comments (list) list of comment object with properties:
				text (str) the comment text
				id (str) the unique comment id
				session (Session instance) the session to close

		Returns:
			the SQL response from inserting/updating the DB
		'''

		# for each comment in a Jira ticket add to DB
		for comment in comments:
			row = session.query(Comments).filter(Comments.id == comment['id']).first()

			# if doesn't exsit then add
			if row is None:
				row = Comments(**comment)
				session.add(row)
			else:
				# else comment exists so update
				for key, val in comment.items():
					setattr(row, key, val)

	def get_tickets(self, type_of_tickets, session, username=''):
		'''gets all tickets of a certain type

		Args:
			type_of_tickets (str) the  type of tickets to get
				pcr_needed, cr_needed, qa_needed, all_my_tickets, my_tickets
			username (str) - if getting all_my_tickets or my_tickets then need username
			session (Session instance) the session to close

		Returns:
			hash with status and a data property of list of ticket objects or error message
		'''
		# get SQLAlchemy search object
		if(type_of_tickets == 'pcr_needed'):
			sql = Tickets.status.like('%PCR - Needed%')
		elif(type_of_tickets == 'cr_needed'):
			sql = Tickets.status.like('%PCR - Completed%')
		elif(type_of_tickets == 'qa_needed'):
			sql = or_( Tickets.status.like('%Ready for QA%'), Tickets.component.like('%\In QA%') )
		elif(type_of_tickets == 'all_my_tickets'):
			sql = Tickets.username.like('%'+username+'%')
		elif(type_of_tickets == 'my_tickets'):
			sql = and_( Tickets.username.like('%'+username+'%'), Tickets.is_active == 1 )
		else:
			sql=''

		# if sql object exists then filter and return results else return false
		if sql:
			rows = session.query(Tickets).filter(sql).all()
			return {'status': True, 'data': rows}
		else:
			return {'status': False, 'data': 'Did not find any tickets in the database'}

	def get_ticket(self, key, session):
		'''gets a Jira ticket from the DB

			Args:
				key (str) the Jira key to get
				session (Session instance) the session to close

			Returns:
				A SQLAlchemy Jira ticket

		'''
		return session.query(ErrorLogs).filter(Tickets.key == key).first()