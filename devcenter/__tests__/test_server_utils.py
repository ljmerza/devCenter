"""Test the server_utils."""
import pytest

from devcenter.server_utils import (
    row2dict, get_branch_name, generate_cred_hash,
    build_commit_message, missing_parameters,
    verify_parameters
)


def test_generate_cred_hash():
    """Test creating a credential hash."""
    cred_hash = generate_cred_hash()
    assert cred_hash == 'Basic Og=='

    cred_hash = generate_cred_hash(username='username', password='password')
    assert cred_hash == 'Basic dXNlcm5hbWU6cGFzc3dvcmQ='


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


def test_verify_parameters():
    """Tests the verify parameters decorator."""
    @verify_parameters('test testing')
    def fake_request(data):
        return 'success'

    data = {'test': 'test', 'testing': 'testing'}
    assert 'success' == fake_request(data)

    result = fake_request({})
    assert not result['status']
    assert result['data'] == '$fake_request is missing required parameters: Missing the following required args: test, testing'


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