#!/usr/bin/python3

import sys
sys.path.append('../../')

from Common.Chat import Chat
import os


username = os.environ['USER']
chat = Chat(debug=True, is_qa_pcr=True, merge_alerts=True)


divider = '-'*40


print('_get_estimate_string')
response = chat._get_estimate_string(3)
print(response)
response = chat._get_estimate_string(10)
print(response)
response = chat._get_estimate_string(0.25)
print(response)
response = chat._get_estimate_string(1)
print(response)
print(divider)


print('send_pcr_needed')
chat.send_pcr_needed(pcr_estimate=3, key='1000', msrp='fake_key', sprint='UDtest', label='LABEL', crucible_id='CRU_123')
chat.send_pcr_needed(pcr_estimate=3, key='1000', msrp='fake_key', sprint='UDtest', label='BETA', crucible_id='CRU_123')
print(divider)

print('send_pcr_needed - should not send')
chat.send_pcr_needed(pcr_estimate=3, key='SASHA-2345', msrp='fake_key', sprint='UDtest', label='BETA', crucible_id='CRU_123')
chat.send_pcr_needed(pcr_estimate=3, key='1000', msrp='fake_key', sprint=' sdfFastTrack df', label='BETA', crucible_id='CRU_123')
print(divider)

print('send_qa_needed')
chat.send_qa_needed(key='1000', msrp='fake_key', sprint='UDtest', label='LABEL', crucible_id='CRU_123')
chat.send_qa_needed(key='1000', msrp='fake_key', sprint='UDtest', label='BETA', crucible_id='CRU_123')
print(divider)

print('send_me_ticket_info')
chat.send_me_ticket_info(key='1000', summary='UDtest summary', username='test_user', ping_message='send_me_ticket_info')
print(divider)

print('send_merge_needed')
chat.send_merge_needed(key='1000', msrp='fake_key',summary='UDtest summary', sprint='UDtest', username=username)
print(divider)

print('send_new_ticket')
chat.send_new_ticket(key='1000', msrp='fake_key', summary='UDtest summary', story_point=6, pcr_estimate=4, username=username)
print(divider)

print('send_merge_alert')
repos_merged = ['ud', 'ember', 'modules', 'another']
chat.send_merge_alert(key='1000', msrp='fake_key', summary='UDtest summary', sprint='6', crucible_id='CRU-123', username=username, repos_merged=repos_merged)
repos_merged = ['ud', 'ember', 'modules']
chat.send_merge_alert(key='1000', msrp='fake_key', summary='UDtest summary', sprint='6', crucible_id='CRU-123', username=username, repos_merged=repos_merged)
repos_merged = ['ud', 'ember']
chat.send_merge_alert(key='1000', msrp='fake_key', summary='UDtest summary', sprint='6', crucible_id='CRU-123', username=username, repos_merged=repos_merged)
repos_merged = ['ud']
chat.send_merge_alert(key='1000', msrp='fake_key', summary='UDtest summary', sprint='6', crucible_id='CRU-123', username=username, repos_merged=repos_merged)
print(divider)


print('beta_statistics')
chat.beta_statistics(uct=7, pcr=6, qa=5, cr=8, beta=9)
print(divider)

print('send_jira_update')
chat.send_jira_update(key='1000', msrp='fake_key', summary='UDtest summary', username=username, ping_message='UCT - Failed', sprint='6')
chat.send_jira_update(key='1000', msrp='fake_key', summary='UDtest summary', username=username, ping_message='Merge Code', sprint='6')
print(divider)
