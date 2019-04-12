"""Tests for fields."""
import copy

from devcenter.jira.fields import (
    get_key, get_msrp, get_full_status, get_status
)


issue = {
    'key': 'TEST-1234',
    'fields':{
        'customfield_10212': 1234,
        'components': [
            {'name':'comp1'},
            {'name':'comp2'}
        ],
        'status': 'status'
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
    pass