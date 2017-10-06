#!/usr/bin/python3

import pymysql.cursors
import re
import os


class MySQL():
	def __init__(self):
		self.connection = ''
		self.attuid = os.environ['USER']
		self.host = os.environ['DEV_SERVER']
		self.database = 'jira'
		self.jira_table = 'jira_tickets'
		self.project_managers =['lk2973', 'ep759g']

	def login(self):
		'''connect to db'''
		self.connection = pymysql.connect( host=self.host, user=self.attuid, password='abc123', db=self.database )

	def logout(self):
		'''close db connection'''
		self.connection.close()

	def add_crucible(self, key, crucible_link):
		key = re.escape(key)
		crucible_link = re.escape(crucible_link)
		# create update sql
		sql = "UPDATE `{}` SET `crucible`='{}' WHERE `key`='{}'".format(self.jira_table, crucible_link, key)
		# create a cursor and update jira ticket
		return self._execute_sql(sql=sql)

	def update_ticket(self, key, attuid, msrp):
		'''pass jira data and see if we need to update or insert anything.'''
		# escape everything
		key = re.escape(key)
		attuid = re.escape(attuid)
		msrp = re.escape(msrp)
		if not msrp:
			msrp = 0
		# create update sql
		sql = "INSERT INTO `{}` (`key`, `attuid`, `msrp`) VALUES ('{}','{}', '{}') ON DUPLICATE KEY UPDATE `key`='{}', `attuid`='{}', `msrp`='{}'".format(self.jira_table, key, attuid, msrp, key, attuid, msrp)
		# create a cursor and update jira ticket
		return self._execute_sql(sql=sql)


	def update_ping(self, field, key, value):
		'''update a ping field in the table for a key'''
		sql = "UPDATE `{}` SET `{}`={} WHERE `key`='{}'".format(self.jira_table, field, value, key)
		return self._execute_sql(sql=sql)
				

	def get_ping(self, field, key):
		'''see if a field has been pinged for this key'''
		sql = "SELECT {} FROM `{}` WHERE `key`='{}'".format(field, self.jira_table, key)
		return self._get_one(sql=sql)


	def get_user_settings(self, attuid, field):
		'''get a user's ping settings. returns 2 if project manager, 1 if user wants ping, 0 if user does not want ping'''
		# if ticket is assigned to pm then ignore
		# if a pm or not assigned yet return 2
		if(attuid in self.project_managers or not attuid):
			return 2
		try:
			# create sql cursor
			with self.connection.cursor() as cursor:
				# if we have a pcr needed get table data to see if we aalready pinged group chat
				sql_select = "SELECT * FROM who_to_ping WHERE `attuid`='{}'".format(attuid)
				cursor.execute(sql_select)
				result = cursor.fetchall()
				# get index of table's user setting
				ping_index = self._fields_index(field=field)
				# if we have a user, the user either wants all or wants this specific type of ping, and not never_ping
				if(len(result) and (result[0][ping_index] or result[0][2]) and not result[0][8]):
					return 1
		except Exception as e: 
			print(str(e))
		return 0

	def _fields_index(self, field):
		if(field == 'new_ping'):
			return 3
		elif(field == 'conflict_ping'):
			return 4
		elif(field == 'cr_fail_ping'):
			return 5
		elif(field == 'uct_fail_ping'):
			return 6
		elif(field == 'merge_ping'):
			return 7
		else:
			return False

	def reset_pings(self, ping_type, key):
		'''resets all pings if any kind of failed status'''
		if ping_type in ['conflict_ping','cr_fail_ping','uct_fail_ping','qa_fail_ping']:
			sql = "UPDATE `{}` SET `pcr_ping`=0,`merge_ping`=0,`conflict_ping`=0,`qa_ping`=0,`uct_fail_ping`=0,`cr_fail_ping`=0,`uct_ping`=0,`qa_fail_ping`=0 WHERE `key`='{}'".format(self.jira_table, key)
			return self._execute_sql(sql=sql)
		return False


	def get_pings(self, key):
		# returns a hash of a jira ticket's ping settings
		sql = "SELECT * FROM `{}` WHERE `key`='{}'".format(self.jira_table, key)
		data = self._get_one(sql=sql)
		if data and len(data) > 10:
			return {
				"key":data[0],
				"attuid": data[1],
				"pcr_ping": data[2],
				"merge_ping": data[3],
				"conflict_ping": data[4],
				"new_ping": data[5],
				"me_ping": data[6],
				"qa_ping": data[7],
				"uct_fail_ping": data[8],
				"cr_fail_ping": data[9],
				"uct_ping": data[10],
				"qa_fail_ping": data[11]
			}
		else:
			return False


	def _get_one(self, sql):
		try:
			# create sql cursor
			with self.connection.cursor() as cursor:
				# execute sql and get one result
				cursor.execute(sql)
				result = cursor.fetchone()
				# if we have a result then return it
				if(len(result)):
					if(len(result) > 1):
						return result
					else:
						return result[0]
		except Exception as e: 
			print(str(e))
		return False


	def _execute_sql(self, sql):
		try:
			# create sql cursor
			with self.connection.cursor() as cursor:
				# update pcr_pinged because now we've pinged the users
				cursor.execute(sql)
				self.connection.commit()
				return True
		except Exception as e: 
			print(str(e))
		return False