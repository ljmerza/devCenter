#!/usr/bin/python3
import os
import base64
import sys

import DevCenterAPI


#g\ get ENV variables
CRUCIBLE_URL = os.environ['CRUCIBLE_URL']
JIRA_URL = os.environ['JIRA_URL']

USER = os.environ['USER']
PASSWORD = os.environ['PASSWORD']

# create object
devCenterAPI = DevCenterAPI.DevCenterAPI()

# testing header
lines = '-'*10
get_url = 'https://jsonplaceholder.typicode.com/posts/1'
post_url = 'http://jsonplaceholder.typicode.com/posts'

post_data = {
    "title": "foo",
    "body": "bar",
    "userId": 1
  }


def get():
	print(f'{lines} get {lines}')
	response = devCenterAPI.get(url=get_url)
	assert(response['status'])
get()


def get_raw():
	print(f'{lines} get_raw {lines}')
	url = ''
	response = devCenterAPI.get_raw(url=get_url)
	assert(response.status_code)
	print(response.text)
get_raw()


def post():
	print(f'{lines} post {lines}')
	response = devCenterAPI.post(url=post_url)
	print(response)
	response = devCenterAPI.post(url=post_url, data=post_data)
	print(response)
post()

def post_json():
	print(f'{lines} post_json {lines}')
	url = ''
	json_data = ''
	devCenterAPI.json_post_data(url=url, json_data=json_data)
	devCenterAPI.put_json(url=url)

def _process_json():
	print(f'{lines} _process_json  {lines}')
	filter_data = ''
	devCenterAPI._process_json()
	devCenterAPI._process_json(filter_data=filter_data)
	devCenterAPI._process_json(filter_data=filter_data)
	devCenterAPI._process_json(filter_data=filter_data)

def _is_json():
	print(f'{lines} _is_json  {lines}')
	my_json = ''
	devCenterAPI._is_json(my_json=my_json)
	devCenterAPI._is_json(my_json=my_json)