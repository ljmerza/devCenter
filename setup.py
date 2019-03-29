#!/usr/bin/python3
"""Dev Center setup script."""
from datetime import datetime as dt
from setuptools import setup, find_packages

from devcenter.const import __version__


REQUIRED_PYTHON_VER = [3, 0, 0]

PROJECT_PACKAGE_NAME = 'devcenter'
PROJECT_AUTHOR = 'Leonardo Merza'
PROJECT_EMAIL = 'ljmerza@gmail.com'
MIN_PY_VERSION = '.'.join(map(str, REQUIRED_PYTHON_VER))
REQUIRES = []

setup(
    name=PROJECT_PACKAGE_NAME,
    version=hass_const.__version__,
    author=PROJECT_AUTHOR,
    author_email=PROJECT_EMAIL,
    include_package_data=True,
    zip_safe=False,
    install_requires=REQUIRES,
    python_requires='>={}'.format(MIN_PY_VERSION),
    test_suite='tests',
    entry_points={
        'console_scripts': [
            'devcenter = devcenter.__main__:main'
        ]
    },
)