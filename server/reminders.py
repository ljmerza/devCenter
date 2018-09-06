#!/usr/bin/python3

import datetime

class reminders(object):

	def __init__(self, chat_obj):
		self.chat_obj = chat_obj
		self.bluejeans_nine = False
		self.log_timesheet_four = False
		self.log_timesheet_nine = False
		self.timesheet_message = "TIMESHEETS!"
		
	def get_now(self):
		self.now = datetime.datetime.now()

	def is_friday(self):
		if(self.now.weekday() == 5):
			return True
		else:
			return False

	def is_weekday(self):
		if(self.now.weekday() in range(0,6)):
			return True
		else:
			return False

	def is_nine(self):
		if self._is_hour(hour=8, minute=45):
			return True
		else: 
			return False

	def is_four(self):
		if self._is_hour(hour=15, minute=45):
			return True
		else: 
			return False

	def is_midnight(self):
		if self._is_hour(hour=00, minute=00):
			return True
		else: 
			return False
			
	def _is_hour(self, hour, minute):
		minute_min = minute
		minute_max = minute + 2
		if(self.now.hour == hour and self.now.minute in range (minute_min, minute_max)):
			return True
		else:
			return False

	def is_timesheet_four(self):
		if( self.is_friday() and self.is_four() and not self.log_timesheet_four):
			return True
		else:
			return False

	def is_timesheet_nine(self):
		if( self.is_friday() and self.is_nine() and not self.log_timesheet_nine):
			return True
		else:
			return False

	def is_bluejeans_nine(self):
		if( self.is_friday() and self.is_nine() and not self.bluejeans_nine):
			return True
		else:
			return False

	def calc_messages(self):
		self.get_now()

		if self.is_midnight():
			self.log_timesheet_four = False
			self.log_timesheet_nine = False

		if self.is_timesheet_four():
			self.log_timesheet_four = True
			self.chat_obj.send_meeting_message(message=self.timesheet_message, chatroom=self.chat_obj.chat_api.apex_chat)

		if self.is_timesheet_nine():
			self.log_timesheet_nine = True
			self.chat_obj.send_meeting_message(message=self.timesheet_message, chatroom=self.chat_obj.chat_api.apex_chat)

		if self.is_bluejeans_nine():
			self.bluejeans_nine = True
			message = """<a href='https://bluejeans.com/9196665226'>Bluejeans</a>"""
			self.chat_obj.send_meeting_message(message=message, chatroom=self.chat_obj.chat_api.apex_chat)