#!/usr/bin/python3

import sys

sys.path.append('Common')
sys.path.append('Chat')
sys.path.append('Crucible')
sys.path.append('Jira')
sys.path.append('Flask')

from Flask import DevCenterServer

from Jira import Jira
from Crucible import Crucible
from DevCenterSQL import DevCenterSQL
from Chat import Chat


sql_echo = False
devflk = True
devdb = True
host = '127.0.0.1'
port = 5859
app_name = 'dev_center'
devChat = True


if 'prod' in sys.argv:
	devdb = False
	host = '0.0.0.0'
	host = 5858
	devflk = False
	devChat = False

# use prod flask server
if 'prodflk':
	devflk = False

# allow echoing of SQL
if 'sql' in sys.argv:
	sql_echo = True

# allow prod chat messages
if 'prodChat':
	devChat = False

# create instances
jira_obj = Jira()
crucible_obj = Crucible()
sql_obj = DevCenterSQL(devdb=devdb, sql_echo=sql_echo)
chat_obj = Chat(debug=devChat)

# start flask server
DevCenterServer.start_server(
	devflk=devflk, host=host, port=port, app_name=app_name, 
	jira_obj=jira_obj, crucible_obj=crucible_obj, 
	sql_obj=sql_obj, chat_obj=chat_obj
)