#!/usr/bin/python3

import pymysql
import re
import os


class DevCenterSQL():
	def __init__(self):
		'''gets parameters from ENV and creates DevCenterSQL object

		Args:
			None

		Returns:
			MySQL object
		'''
		self.username = os.environ['USER']
		self.host = os.environ['DEV_SERVER']
		self.database ='dev_center'
		self.sql_password = os.environ['SQL_PASSWORD']
		############################################
		pm1 = os.environ['PM1']
		pm2 = os.environ['PM2']
		self.project_managers = [pm1, pm2]

	def login(self):
		'''logs into DevCenter the SQL DB and creates a connection property on the instance

		Args:
			None
		
		Returns:
			None
		'''
		self.connection = pymysql.connect( host=self.host, user=self.username, password=self.sql_password, db=self.database, cursorclass=pymysql.cursors.DictCursor )

	def logout(self):
		'''closes the DB connection

		Args:
			None

		Returns:
			None
		'''
		if self.connection:
			self.connection.close()

	def add_crucible(self, key, crucible_id):
		'''adds a cricuble key to a Jira row

		Args:
			key (str) the Jira key to associate the Crucible review with
			crucible_id (str) the Crucible ID to to add to the Jira issue

		Returns:
			the SQL execution result
		'''
		# escape everything
		key = re.escape( str(key) )
		crucible_id = re.escape( str(crucible_id) )
		# create update sql
		sql = "UPDATE tickets SET `crucible`='{}' WHERE `key`='{}'".format(crucible_id, key)
		# create a cursor and update jira ticket
		return self._execute_sql(sql=sql)

	def update_ticket(self, key, username, msrp=0):
		'''inserts a Jira ticket's key, username, and MSRP values in the DB 
		unless it already exist then updates these values.

		Args:
			key (str) - the key of the Jira ticket
			username (str) - the username of the user assigned to the Jira ticket
			msrp (str) - optional MSRP of the Jira ticket (default 0)

		Returns:
			the SQL response from inserting/updating the DB
		'''
		# escape everything
		key = re.escape( str(key) )
		username = re.escape( str(username) )
		msrp = re.escape( str(msrp) )
		# create update SQL
		sql = "INSERT INTO tickets (`key`, `username`, `msrp`) VALUES ('{}','{}', '{}') ON DUPLICATE KEY UPDATE `key`='{}', `username`='{}', `msrp`='{}'".format(key, username, msrp, key, username, msrp)
		# create a cursor and update Jira ticket
		return self._execute_sql(sql=sql)


	def update_ping(self, field, key, value=0):
		'''updates a ping field for a Jira ticket

		Args:
			field (str) the field name to update
			key (str) the key of the Jira ticket to update
			value (int) the value to update the fields to (default 0)

		Returns:
			the SQL response from updating the DB
		'''
		# escape everything
		field = re.escape( str(field) )
		# key = re.escape( str(key) )
		value = re.escape( str(value) )
		sql = "UPDATE tickets SET `{}`={} WHERE `key`='{}'".format(field, value, key)
		return self._execute_sql(sql=sql)
				
	def get_user_ping_value(self, username, field):
		'''get a user's ping value for a particular field type

		Args:
			field (str) the field name to get the value of
			username (str) the username of the Jira ticket

		Returns:
			2 if project manager or usernmae not assigned
			1 if user wants ping 
			0 if user does not want ping
		'''
		# if ticket is assigned to pm then ignore
		# if a pm or not assigned yet return 2
		if(username in self.project_managers or not username):
			return 2
		# escape everything
		field = re.escape( str(field) )
		username = re.escape( str(username) )
		# get user settings
		sql = "SELECT * FROM users WHERE `username`='{}'".format(username)
		data = self._get_one(sql=sql)
		# if user wants ping then return 1 else return 0
		if (data is not None) and field in data:
			return 1
		else:
			return 0

	def reset_pings(self, ping_type, key):
		'''resets all pings of any kind of failed status

		Args:
			ping_type (str) the type of ping that we are resetting
			key (str) the key of the Jira ticket

		Returns:
			False if failed or the SQL response
		'''
		if ping_type in ['conflict_ping','cr_fail_ping','uct_fail_ping','qa_fail_ping']:
			# escape everything
			ping_type = re.escape( str(ping_type) )
			key = re.escape( str(key) )
			# execute SQL
			sql = "UPDATE tickets SET `pcr_ping`=0,`merge_ping`=0,`conflict_ping`=0,`qa_ping`=0,`uct_fail_ping`=0,`cr_fail_ping`=0,`uct_ping`=0,`qa_fail_ping`=0 WHERE `key`='{}'".format(key)
			return self._execute_sql(sql=sql)
		return False

	def get_ping(self, field, key):
		'''see if a field has been pinged for this Jira ticket

		Args:
			field (str) the field name to get the value of
			key (str) the key of the Jira ticket

		Returns:
			the SQL response from the DB
		'''
		# escape everything
		field = re.escape( str(field) )
		key = re.escape( str(key) )
		# run SQL
		sql = "SELECT {} FROM tickets WHERE `key`='{}'".format(field, key)
		data = self._get_one(sql=sql)
		# if data came back then get field value
		if (data and field in data):
			return data[field]
		else: 
			return False

	def get_pings(self, key):
		'''gets a Jira ticket's ping settings

		Args:
			key (str) the key of the Jira ticket

		Returns:
			False if failed or the SQL response in dict form
		'''
		key = re.escape( str(key) )
		sql = "SELECT * FROM `tickets` WHERE `key`='{}'".format(key)
		data = self._get_one(sql=sql)
		if data is not None:
			return data
		else:
			return False


	def _get_one(self, sql):
		'''internal method to get one row result from the SQL response

		Args:
			sql (str) the SQL query to run to get a response from

		Returns:
			False if failed or the single row response from the SQL query
		'''
		try:
			# create sql cursor
			with self.connection.cursor() as cursor:
				# execute sql and get one result
				cursor.execute(sql)
				return cursor.fetchone()
		except Exception as e:
			self.sql_object.log_error(message=str(e))
			return False


	def _execute_sql(self, sql):
		'''internal method to execute a SQL query

		Args:
			sql (str) the SQL query to run to get a response from

		Returns:
			False if failed or the response from the SQL query execution
		'''
		try:
			# create sql cursor
			with self.connection.cursor() as cursor:
				# update pcr_pinged because now we've pinged the users
				cursor.execute(sql)
				self.connection.commit()
				return True
		except Exception as e: 
			self.sql_object.log_error(message=str(e))
			return False

	def log_error(self, message):
		'''logs an error message in the DB. If message already exist then just replaces it
			to avoid duplicate entries

		Args:
			message (str) the message to add to the log

		Returns:
			The response from the SQL query execution
		'''
		message = re.escape( str(message) )
		sql = "INSERT INTO logs (`message`, `timestamp`) VALUES ('{}',NOW()) ON DUPLICATE KEY UPDATE `message`=`message`".format(message)
		return self._execute_sql(sql=sql)