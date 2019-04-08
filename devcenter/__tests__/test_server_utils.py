"""Test the server_utils."""
import pytest

from devcenter.server_utils import (
    row2dict, get_branch_name, 
    build_commit_message, missing_parameters
)

def test_get_branch_name():
    branch = get_branch_name(username='', msrp='', summary='')
    assert branch == '--'

    branch = get_branch_name(username='username', msrp='', summary='')
    assert branch == 'username--'

    branch = get_branch_name(username='username', msrp='msrp', summary='')
    assert branch == 'username-msrp-'

    branch = get_branch_name(username='username', msrp='msrp', summary="summary test's the \"date\"")
    assert branch == 'username-msrp-summary-tests-the-date'