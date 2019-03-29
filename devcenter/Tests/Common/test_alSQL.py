import DevCenterSQL

d=DevCenterSQL.DevCenterSQL()



jira_ticket = {}

jira_ticket['key'] = 'test'
jira_ticket['username'] = 'test'
jira_ticket['msrp'] = 123456
jira_ticket['summary'] = 'test'
jira_ticket['status'] = 'test'
jira_ticket['component'] = 'test'
jira_ticket['story_point'] = 'test'
jira_ticket['sprint'] = 'test'
jira_ticket['epic_link'] = 'test'
jira_ticket['label'] = 'test'

print(jira_ticket)
d.update_ticket(jira_ticket=jira_ticket)
