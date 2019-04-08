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

REQUIRES = [
    "SQLAlchemy==1.3.2",
    "requests==2.21.0",
    "Flask==1.0.2",
    "Flask-Cors==3.0.7",
    "flask-socketio==3.3.2",
    "PyMySQL==0.9.3",
    "gevent-websocket==0.10.1",
    "gevent==1.4.0",
    "gunicorn==19.9.0",
    "PyCrypto==2.6.1"
]

setup(
    name=PROJECT_PACKAGE_NAME,
    version=__version__,
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