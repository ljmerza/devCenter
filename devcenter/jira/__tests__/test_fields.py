"""Tests for fields."""
import copy

from devcenter.jira.fields import (
    get_key, get_msrp, get_full_status, get_status,
    get_summary, get_username, get_display_name,
    get_user_details
)


issue = {
    'key': 'TEST-1234',
    'fields':{
        'customfield_10212': 1234,
        'components': [
            {'name':'comp1'},
            {'name':'comp2'}
        ],
        'status': {
            'name': 'status',
            'id': 1
        },
        'summary': 'summary',
        'assignee': {
            'name': 'username',
            'displayName': 'displayName',
            'emailAddress': 'emailAddress'
        }
    }
    
}


def test_get_key():
    extracted_key = get_key(issue)
    assert extracted_key == issue['key']

    issue_copy = copy.deepcopy(issue)
    del issue_copy['key']
    extracted_key = get_key(issue_copy)
    assert extracted_key == ''


def test_get_msrp():
    extracted_get_msrp = get_msrp(issue)
    assert extracted_get_msrp == issue['fields']['customfield_10212']

    issue_copy = copy.deepcopy(issue)
    del issue_copy['fields']['customfield_10212']
    extracted_get_msrp = get_msrp(issue_copy)
    assert extracted_get_msrp == 0

    extracted_get_msrp = get_msrp({})
    assert extracted_get_msrp == 0


def test_get_full_status():
    extracted_status = get_full_status(issue)
    assert extracted_status['status'] == issue['fields']['status']
    assert extracted_status['components'][0]['name'] == issue['fields']['components'][0]['name']
    assert extracted_status['components'][1]['name'] == issue['fields']['components'][1]['name']

    extracted_status = get_full_status({})
    assert not len(extracted_status['components'])
    assert extracted_status['status'] == {}

    issue_copy = copy.deepcopy(issue)
    issue_copy['fields']['components'].append({'name':'BETA'})
    extracted_status = get_full_status(issue_copy)
    components = extracted_status['components']
    non_beta = [x for x in components if x.get('name').upper() != 'BETA']
    assert len(non_beta) == 2


def test_get_status():
    extracted_status = get_status(issue)
    assert extracted_status == issue['fields']['components'][0]['name']

    issue_copy = {'fields': {'status': {'name': 'testname'}}}
    extracted_status = get_status(issue_copy)
    assert extracted_status == 'testname'

    extracted_status = get_status({})
    assert extracted_status == ''


def test_get_summary():
    summary = get_summary(issue)
    assert summary == issue['fields']['summary']

    summary = get_summary({})
    assert summary == ''


def test_get_username():
    username = get_username(issue)
    assert username == issue['fields']['assignee']['name']

    username = get_username({})
    assert username == ''

def test_get_display_name():
    name = get_display_name(issue)
    assert name == issue['fields']['assignee']['displayName']

    name = get_display_name({})
    assert name == ''

def test_get_user_details():
    user_details = get_user_details(issue)
    assert user_details['username'] == issue['fields']['assignee']['name']
    assert user_details['display_name'] == issue['fields']['assignee']['displayName']
    assert user_details['email_address'] == issue['fields']['assignee']['emailAddress']

    user_details = get_user_details({})
    assert user_details['username'] == ''
    assert user_details['display_name'] == ''
    assert user_details['email_address'] == ''