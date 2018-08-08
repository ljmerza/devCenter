import os
import base64

from ..Chat.Chat import Chat 

key = 'TEST-1234'
username = os.environ['USERNAME']
message = """<a href='https://bluejeans.com/9196665226'>Bluejeans</a>"""
chatroom = 'q_rooms_ep759g1469815893161'

ct = Chat(debug=False, no_pings=False, is_qa_pcr=False, merge_alerts=False)

################# send_meeting_message
# response = ct.chat_api.send_meeting_message(message, chatroom)
# print(response)


################# send_pcr_comments
pullLinks = [
	{'repo':'repo', 'link':'link'},
	{'repo':'repo2', 'link':'link2'},
	{'repo':'repo3', 'link':'link3'},
]
response = ct.send_pcr_comments(
						fromUsername=username, 
						fromName=username, 
						toUsername=username, 
						pullLinks=pullLinks, 
						key=key
					)
print(response)