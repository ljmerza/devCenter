#!/usr/bin/python3

import DevCenterSQL

fake_key = 1000000
fake_key2 = 10000001
fake_key_bad = 1000002
crucible_key = 'QWE-123'

attuid = os.environ['USER']
pm_attuid = 'ep'
fake_attuid = 'qwerty'

# reate object, login, and logout
sql_object = DevCenterSQL.DevCenterSQL()
sql_object.login()
sql_object.logout()

# log back in
sql_object.login()

# create Jira rows with and without a MSRP
response = sql_object.update_ticket(key=fake_key, attuid=attuid, msrp=fake_msrp)
response = sql_object.update_ticket(key=fake_key2, attuid=attuid)

# update Jira row
response = sql_object.update_ticket(key=fake_key)
response = sql_object.add_crucible(key=fake_key, crucible_key=crucible_key)

# update pings
response = sql_object.update_ping(field='pcr_ping', key=fake_key, value=1)
response = sql_object.update_ping(field='pcr_ping', key=fake_key)
response = sql_object.update_ping(field='bad_field', key=fake_key)

# get one ping
response = sql_object.get_ping(field='pcr_ping', key=fake_key)
response = sql_object.get_ping(field='bad_field', key=fake_key)

#get all pings
response = sql_object.get_pings(key=fake_key)

# reset pings
response = sql_object.reset_pings(ping_type='pcr_ping', key=fake_key)
response = sql_object.reset_pings(ping_type='fake_ping', key=fake_key)

# user settings
response = sql_object.get_user_settings(attuid=attuid, field='all_ping')
response = sql_object.get_user_settings(attuid=pm_attuid, field='all_ping')
response = sql_object.get_user_settings(attuid=fake_attuid, field='all_ping')
response = sql_object.get_user_settings(attuid=attuid, field='bad_field')

