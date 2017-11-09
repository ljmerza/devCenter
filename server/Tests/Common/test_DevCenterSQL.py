#!/usr/bin/python3

import DevCenterSQL
import os

fake_key = 'ZZZ-1234'
fake_key2 = 'ZZZ-12346'
fake_key_bad = 'ZZZ-12347'
fake_msrp = '10000001'
fake_crucible_id = 'ZZZ-12345'

username = os.environ['USER']
pm_username = 'ep759g'
fake_username = 'qwerty'

divider = '-'*40

# create object, login, and logout
sql_object = DevCenterSQL.DevCenterSQL()
sql_object.login()
sql_object.logout()

# log back in
sql_object.login()

# create Jira rows with and without a MSRP
print('create Jira rows with and without a MSRP')
response = sql_object.update_ticket(key=fake_key, username=username, msrp=fake_msrp)
print(response)
response = sql_object.update_ticket(key=fake_key2, username=username)
print(response)
print(divider)

# update Jira row
print('update_ticket')
response = sql_object.update_ticket(key=fake_key2, username=username, msrp=fake_msrp )
print(response)
print(divider)

def add_crucible():
	print('add_crucible')
	response = sql_object.add_crucible(key=fake_key, crucible_id=fake_crucible_id)
	print(response)
	print(divider)

def update_ping():
	# update pings
	print('update_ping')
	response = sql_object.update_ping(field='pcr_ping', key=fake_key, value=1)
	print(response)
	response = sql_object.update_ping(field='merge_ping', key=fake_key)
	print(response)
	response = sql_object.update_ping(field='bad_field', key=fake_key)
	print(response)
	print(divider)

def get_ping():
	# get one ping
	print('get_ping')
	response = sql_object.get_ping(field='pcr_ping', key=fake_key)
	print(response)
	response = sql_object.get_ping(field='bad_field', key=fake_key)
	print(response)
	print(divider)

def get_pings():
	#get all pings
	print('get_pings')
	response = sql_object.get_pings(key=fake_key)
	print(response)
	response = sql_object.get_pings(key=fake_key_bad)
	print(response)
	print(divider)

# reset pings
def reset_pings():
	print('reset_pings')
	response = sql_object.reset_pings(ping_type='qa_fail_ping', key=fake_key)
	print(response)
	response = sql_object.reset_pings(ping_type='fake_ping', key=fake_key)
	print(response)
	print(divider)

# user settings
def get_user_ping_value():
	print('get_user_ping_value')
	response = sql_object.get_user_ping_value(username=username, field='all_ping')
	print(response)
	response = sql_object.get_user_ping_value(username=pm_username, field='all_ping')
	print(response)
	response = sql_object.get_user_ping_value(username=fake_username, field='all_ping')
	print(response)
	response = sql_object.get_user_ping_value(username=username, field='bad_field')
	print(response)

