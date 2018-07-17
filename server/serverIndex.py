#!/usr/bin/python3
import sys
import os

from . import DevCenterServer

sql_echo = False
devflk = True
devdb = True
host = '127.0.0.1'
port = 5859
app_name = 'dev_center'
dev_chat = True

if 'prodhost' in sys.argv:
	host = '0.0.0.0'


if 'prod' in sys.argv:
	devdb = False
	host = '0.0.0.0'
	port = 5858
	devflk = False
	dev_chat = False

# use prod flask server
if 'prodflk':
	devflk = False

# allow echoing of SQL
if 'sql' in sys.argv:
	sql_echo = True

# allow prod chat messages
if 'prodChat':
	dev_chat = False

# start flask server
DevCenterServer.start_server(
	devflk=devflk, host=host, port=port, 
	app_name=app_name, dev_chat=dev_chat, 
	devdb=devdb, sql_echo=sql_echo,
	no_pings=False
)
