import os
import base64

from ..Chat.Chat import Chat 

debug=False 
no_pings=False
is_qa_pcr=False
merge_alerts=False

ct = Chat(debug=debug, no_pings=no_pings, is_qa_pcr=is_qa_pcr, merge_alerts=merge_alerts)

message = """<a href='https://bluejeans.com/9196665226'>Bluejeans</a>"""
chatroom = 'q_rooms_ep759g1469815893161'

################# send_meeting_message
response = ct.chat_api.send_meeting_message(message, chatroom)
print(response)