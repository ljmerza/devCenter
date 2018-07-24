import os
import base64

from ..Chat.Chat import Chat 

debug=0 
no_pings=0,
is_qa_pcr=0
merge_alerts=0

ct = Chat(debug=debug, no_pings=no_pings, is_qa_pcr=is_qa_pcr, merge_alerts=merge_alerts)

message = 'TEST'
chatroom = ct.chat_api.jira_chat

################# send_meeting_message
ct.send_meeting_message(message, chatroom)