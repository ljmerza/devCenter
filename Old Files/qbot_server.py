from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from flask import Flask
import requests
from requests.auth import HTTPBasicAuth
from flask import request

t =requests.post('', data = 'http://auto:8888', auth=HTTPBasicAuth(), proxies={'http': '','https': '' })
print(t)

app = Flask(__name__)

@app.route('/')
def index():
	print('dsaf')
	print(request)
        


app.run(port=8888)