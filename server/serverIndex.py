#!/usr/bin/python3
import sys
import os

from .Flask import DevCenterServer

from .Jira.Jira import Jira
from .Crucible.Crucible import Crucible
from .CodeCloud.CodeCloud import CodeCloud
from .SQL.DevCenterSQL import DevCenterSQL
from .Chat.Chat import Chat
from .APIs.Order import OrderAPI


sql_echo = False
devflk = True
devdb = True
host = '127.0.0.1'
port = 5859
app_name = 'dev_center'
devChat = True

if 'prodhost' in sys.argv:
	host = '0.0.0.0'


if 'prod' in sys.argv:
	devdb = False
	host = '0.0.0.0'
	port = 5858
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
code_cloud_obj = CodeCloud()
sql_obj = DevCenterSQL(devdb=devdb, sql_echo=sql_echo)
chat_obj = Chat(debug=devChat, no_pings=False)
order_object = OrderAPI()

# start flask server
DevCenterServer.start_server(
	devflk=devflk, host=host, port=port, app_name=app_name, 
	jira_obj=jira_obj, crucible_obj=crucible_obj, code_cloud_obj=code_cloud_obj,
	sql_obj=sql_obj, chat_obj=chat_obj, order_object=order_object
)
