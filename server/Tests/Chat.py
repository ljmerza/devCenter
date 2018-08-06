import os
import base64

from ..Chat.Chat import Chat 

debug=False 
no_pings=False
is_qa_pcr=False
merge_alerts=False

ct = Chat(debug=debug, no_pings=no_pings, is_qa_pcr=is_qa_pcr, merge_alerts=merge_alerts)

message = """<table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">First</th>
      <th scope="col">Last</th>
      <th scope="col">Handle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Mark</td>
      <td>Otto</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Jacob</td>
      <td>Thornton</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td>Larry</td>
      <td>the Bird</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</table>"""

chatroom = 'q_rooms_lm240n1533318454416'

################# send_meeting_message
response = ct.chat_api.send_meeting_message(message, chatroom)
print(response)