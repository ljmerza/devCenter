#!/usr/bin/python3
import os
import base64
import sys

import DevCenterAPI

# create object
devCenterAPI = DevCenterAPI.DevCenterAPI()

# testing header
lines = '-'*10
get_url = 'https://jsonplaceholder.typicode.com/posts/1'
post_url = 'http://jsonplaceholder.typicode.com/posts'
bad_url = 'http://jsonplaceholder.typicode.com/badURL'

post_data = {
	"title": "foo",
	"body": "bar",
	"userId": 1
}

def get():
	print(f'{lines} get {lines}')
	response = devCenterAPI.get(url=get_url)
	assert(response['status'])
	print(response)
	response = devCenterAPI.get(url=bad_url)
	assert(not response['status'])
	print(response)

def get_raw():
	print(f'{lines} get_raw {lines}')
	response = devCenterAPI.get_raw(url=get_url)
	assert(response.status_code)
	print(response.text)
	response = devCenterAPI.get_raw(url=bad_url)
	assert(response.status_code == 404)
	print(response)

def post():
	print(f'{lines} post {lines}')
	response = devCenterAPI.post(url=post_url)
	print(response)
	assert(response['status'])
	response = devCenterAPI.post(url=post_url, data=post_data)
	print(response)
	assert(response['status'])
	response = devCenterAPI.post(url=bad_url)
	print(response)
	assert(not response['status'])

def post_json():
	print(f'{lines} post_json {lines}')
	json_data = {}
	response = devCenterAPI.post_json(url=post_url, json_data=json_data)
	print(response)
	assert(response['status'])
	response = devCenterAPI.post_json(url=bad_url, json_data=json_data)
	print(response)
	assert(not response['status'])


get()
get_raw()
post()
post_json()