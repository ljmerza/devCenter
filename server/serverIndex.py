#!/usr/bin/python3

import sys

sys.path.append('Common')
sys.path.append('Crucible')
sys.path.append('Jira')
sys.path.append('Flask')

from Flask import DevCenterServer

from Jira import Jira
from Crucible import Crucible
from DevCenterSQL import DevCenterSQL


sql_echo = False
devflk = True
devdb = True
host = '127.0.0.1'
port = 5858
app_name = 'dev_center'


if 'prod' in sys.argv:
	devdb = False
	host = '0.0.0.0'
	devflk = False

# use prod flask server
if 'prodflk':
	devflk = False

# allow echoing of SQL
if 'sql' in sys.argv:
	sql_echo = True


# create instances
jira_obj = Jira()
crucible_obj = Crucible()
sql_object = DevCenterSQL(devdb=devdb, sql_echo=sql_echo)

# start flask server
DevCenterServer.start_server(
	devflk=devflk, host=host, port=port, app_name=app_name, 
	jira_obj=jira_obj, crucible_obj=crucible_obj, 
	sql_object=sql_object
)