"""Test the server_utils."""
import pytest

from devcenter.server_utils import (
    row2dict, get_branch_name, 
    build_commit_message, missing_parameters
)


def test_get_branch_name():
    """Tests get_branch_name."""
    branch = get_branch_name(username='', msrp='', summary='')
    assert branch == '-'*30

    branch = get_branch_name(username='username', msrp='', summary='')
    assert branch == 'username----------------------'

    branch = get_branch_name(username='username', msrp='msrp', summary='')
    assert branch == 'username-msrp--msrp-msrp-msrp-msrp'

    branch = get_branch_name(username='username', msrp='msrp', summary="summary test's the \"date\"")
    assert branch == 'username-msrp-summary-tests-the-date'


def test_build_commit_message():
    """Tests build_commit_message."""
    commit_message = build_commit_message(key='', msrp='', summary='', epic_link='')
    assert commit_message == '[] Ticket #'

    commit_message = build_commit_message(key='TS-12345', msrp='12345', summary='', epic_link='')
    assert commit_message == '[TS-12345] Ticket #12345'

    commit_message = build_commit_message(key='TS-12345', msrp='12345', summary='testing the summary', epic_link='TS-5000')
    assert commit_message == '[TS-12345] Ticket #12345 - TS-5000 - testing the summary'


def test_missing_parameters_required():
    """Tests missing_parameters for required parameters."""
    params = {'req': 'test'}
    missing = missing_parameters(params=params, required=['req', 'missing'])
    assert missing == 'Missing the following required args: missing'

    params = {'req': ''}
    missing = missing_parameters(params=params, required=['req', 'missing'])
    assert missing == 'Missing the following required args: req, missing'

    params = {'req': 'test', 'missing': 'test'}
    missing = missing_parameters(params=params, required=['req', 'missing'])
    assert not missing


def test_missing_parameters_one_required():
    """Tests missing_parameters for one required parameters."""
    params = {}
    missing = missing_parameters(params=params, one_required=['one_req', 'missing'])
    assert missing == 'Missing at least one of the following optional args: one_req, missing'

    params = {}
    missing = missing_parameters(params=params, required=['req'], one_required=['one_req', 'missing'])
    assert missing == "Missing the following required args: req, and at least one of the following optional args: one_req, missing"

    missing = missing_parameters(params=params, required=['req'], one_required=['one_req', 'missing'])
    params = {'req': 'test', 'one_req': 'test'}
    missing = missing_parameters(params=params, required=['req'], one_required=['one_req', 'missing'])
    assert not missing