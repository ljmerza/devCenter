#!/usr/bin/python3
import sys

sys.path.append('../Chat')

from ChatAPI import ChatAPI
chat = ChatAPI(0,0)

message = ''
meeting_room = ''
username = ''

# chat.send_meeting_message(message, meeting_room)
# chat.send_meeting_message(message, username)