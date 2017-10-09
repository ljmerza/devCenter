#!/usr/bin/python3

import datetime


class ApexReminders(object):

	def __init__(self, qbot_obj):

		self.qbot_obj = qbot_obj
		###################################
		self.log_hours_four = False
		self.log_hours_five = False
		self.log_hours_six = False
		###################################
		self.log_timesheet_nine = False
		self.log_timesheet_four = False
		self.log_timesheet_five = False
		self.log_timesheet_six = False
		###################################
		self.log_hours_four = False
		self.log_message = 'Log yo dang time!'
		self.timesheet_message = "TIMESHEETS!"
		###################################
		
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

	def is_five(self):
		if self._is_hour(hour=16, minute=45):
			return True
		else: 
			return False

	def is_six(self):
		if self._is_hour(hour=17, minute=45):
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

############### reset messages ######################

	def is_midnight(self):
		if self._is_hour(hour=00, minute=00):
			self.log_hours_four = False
			self.log_hours_five = False
			self.log_hours_six = False

			self.log_time_nine = False
			self.log_time_four = False
			self.log_time_five = False
			self.log_time_six = False

############### time sheets ##########################

	def is_timesheet_nine(self):
		if( self.is_friday() and self.is_nine() and not self.log_timesheet_nine):
			self.log_timesheet_nine = True
			return self.timesheet_message
		else:
			return False

	def is_timesheet_four(self):
		if( self.is_friday() and self.is_four() and not self.log_timesheet_four):
			self.log_timesheet_four = True
			return self.timesheet_message
		else:
			return False

	def is_timesheet_five(self):
		if( self.is_friday() and self.is_five() and not self.log_timesheet_five):
			self.log_timesheet_five = True
			return self.timesheet_message
		else:
			return False

	def is_timesheet_six(self):
		if( self.is_friday() and self.is_six() and not self.log_timesheet_six):
			self.log_timesheet_six = True
			return self.timesheet_message
		else:
			return False

############### log hours ######################

	def is_log_hours_four(self):
		if( self.is_weekday() and self.is_four() and not self.log_hours_four):
			self.log_hours_four = True
			return self.log_message
		else:
			return False

	def is_log_hours_five(self):
		if( self.is_weekday() and self.is_five() and not self.log_hours_five):
			self.log_hours_five = True
			return self.log_message
		else:
			return False

	def is_log_hours_six(self):
		if( self.is_weekday() and self.is_six() and not self.log_hours_six):
			self.log_hours_six = True
			return self.log_message
		else:
			return False

############### main method ######################

	def calc_messages(self):
		self.get_now()
		self.is_midnight()

		# check for time sheet message
		result = self.is_timesheet_nine()
		if(result):
			self.qbot_obj.send_meeting_message(result)
		result = self.is_timesheet_four()
		if(result):
			self.qbot_obj.send_meeting_message(result)
		result = self.is_timesheet_five()
		if(result):
			self.qbot_obj.send_meeting_message(result)
		result = self.is_timesheet_six()
		if(result):
			self.qbot_obj.send_meeting_message(result)

		# check for log time message
		result = self.is_log_hours_four()
		if(result):
			self.qbot_obj.send_meeting_message(result)
		result = self.is_log_hours_five()
		if(result):
			self.qbot_obj.send_meeting_message(result)
		result = self.is_log_hours_six()
		if(result):
			self.qbot_obj.send_meeting_message(result)



