#!/usr/bin/python3

from sqlalchemy import or_, and_
from .SQLModels import Tickets, Comments, ErrorLogs

class SQLTickets():

	def add_crucible(self, key, crucible_id, session):
		row = session.query(Tickets).filter(Tickets.key == key).first()
		row.crucible_id = crucible_id
		return session.commit()	

	def set_inactive_tickets(self, jira_tickets, session):
		all_inactive_tickets = session.query(Tickets).filter(Tickets.is_active == 1).all()
		for jira_ticket in jira_tickets['data']:
			# remove current ticket from inactive tickets because we know it's still active
			all_inactive_tickets = [ x for x in all_inactive_tickets if x.key != jira_ticket['key'] ]

		for jira_ticket in all_inactive_tickets:
			jira_ticket.is_active = 0
		session.commit()

	def update_ticket(self, jira_ticket, session):
		jira_ticket= {
			'msrp': jira_ticket['msrp'],
			'key': jira_ticket['key'],
			'username': jira_ticket['username']
		}

		jira_ticket['is_active'] = 1

		row = session.query(Tickets).filter(Tickets.key == jira_ticket['key']).first()
		if row is None:
			row = Tickets(**jira_ticket)
			session.add(row)
		else:
			for key, val in jira_ticket.items():
				setattr(row, key, val)

		# add comments of ticket and commit
		# self._update_comments(comments=comments, session=session)

		session.commit()
		

	def _update_comments(self, comments, session):
		for comment in comments:
			row = session.query(Comments).filter(Comments.id == comment['id']).first()
			if row is None:
				row = Comments(**comment)
				session.add(row)
			else:
				for key, val in comment.items():
					setattr(row, key, val)

	def get_tickets(self, type_of_tickets, session, username=''):
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
		return session.query(ErrorLogs).filter(Tickets.key == key).first()
