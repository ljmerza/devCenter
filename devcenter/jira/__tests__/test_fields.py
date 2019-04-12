"""Tests for fields."""
import copy

from devcenter.jira.fields import (
    get_key, get_msrp, get_full_status, get_status,
    get_summary, get_username, get_display_name,
    get_user_details, _get_display_name, get_component,
    get_story_point
)


USER_ISSUE = {
    'fields':{
        'assignee': {
            'name': 'username',
            'displayName': 'displayName',
            'emailAddress': 'emailAddress'
        }
    }
}

STATUS_ISSUE = {
    'fields':{
        'components': [
            {'name':'comp1'},
            {'name':'comp2'}
        ],
        'status': {
            'name': 'status',
            'id': 1
        }
    }
    
}


def test_get_key():
    extracted_key = get_key({'key': 'TEST-1234'})
    assert extracted_key == 'TEST-1234'

    extracted_key = get_key({})
    assert extracted_key == ''


def test_get_msrp():
    extracted_get_msrp = get_msrp({'fields':{'customfield_10212': 1234}})
    assert extracted_get_msrp == 1234

    extracted_get_msrp = get_msrp({'fields': {}})
    assert extracted_get_msrp == 0

    extracted_get_msrp = get_msrp({})
    assert extracted_get_msrp == 0


def test_get_full_status():
    extracted_status = get_full_status(STATUS_ISSUE)
    assert extracted_status['status'] == STATUS_ISSUE['fields']['status']
    assert extracted_status['components'][0]['name'] == STATUS_ISSUE['fields']['components'][0]['name']
    assert extracted_status['components'][1]['name'] == STATUS_ISSUE['fields']['components'][1]['name']

    extracted_status = get_full_status({})
    assert not len(extracted_status['components'])
    assert extracted_status['status'] == {}

    issue_copy = copy.deepcopy(STATUS_ISSUE)
    issue_copy['fields']['components'].append({'name':'BETA'})
    extracted_status = get_full_status(issue_copy)
    components = extracted_status['components']
    non_beta = [x for x in components if x.get('name').upper() != 'BETA']
    assert len(non_beta) == 2


def test_get_status():
    extracted_status = get_status(STATUS_ISSUE)
    assert extracted_status == STATUS_ISSUE['fields']['components'][0]['name']

    issue_copy = copy.deepcopy(STATUS_ISSUE)
    del issue_copy['fields']['components']
    issue_copy['fields']['status']['name'] = 'testname'
    extracted_status = get_status(issue_copy)
    assert extracted_status == 'testname'

    extracted_status = get_status({})
    assert extracted_status == ''


def test_get_summary():
    summary = get_summary({'fields':{'summary': 'summary'}})
    assert summary == 'summary'

    summary = get_summary({})
    assert summary == ''


def test_get_username():
    username = get_username(USER_ISSUE)
    assert username == USER_ISSUE['fields']['assignee']['name']

    username = get_username({})
    assert username == ''


def test_get_display_name():
    name = get_display_name(USER_ISSUE)
    assert name == USER_ISSUE['fields']['assignee']['displayName']

    name = get_display_name({})
    assert name == ''


def test_get_user_details():
    user_details = get_user_details(USER_ISSUE)
    assert user_details['username'] == USER_ISSUE['fields']['assignee']['name']
    assert user_details['display_name'] == USER_ISSUE['fields']['assignee']['displayName']
    assert user_details['email_address'] == USER_ISSUE['fields']['assignee']['emailAddress']

    user_details = get_user_details({})
    assert user_details['username'] == ''
    assert user_details['display_name'] == ''
    assert user_details['email_address'] == ''


def test_get_display_name():
    name = _get_display_name('test (testname)')
    assert name == 'test'

    name = _get_display_name('')
    assert name == ''

    name = _get_display_name('test')
    assert name == 'test'


def test_get_component():
    components = get_component(STATUS_ISSUE)
    assert components == 'comp1 comp2'

    components = get_component({})
    assert components == ''


def test_get_story_point():
    workday = 60*60*8
    points = get_story_point({'fields':{'timeoriginalestimate':4*workday}})
    assert points == 2

    points = get_story_point({'fields':{'timeoriginalestimate':1*workday}})
    assert points == 1

    points = get_story_point({})
    assert points == 0