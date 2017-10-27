#!/usr/bin/python3
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import paramiko



class SSH(object):
	'''creates SSH connection object to a dev server'''

	def __init__(self, username, rsa_key_path, host):
		'''initialize variables'''
		self.host = host
		self.username = username
		self.rsa_key_path = rsa_key_path
		self.base_cmd = f'perl /opt/{username}/chat.pl '
		self.cmd = '' 
		self.q_chat = ''
		self.client_ssh = ''
		self.APEX = ''
		self.DTI = ''

	def open_ssh_connection(self):
		'''create a connection to the dev server'''
		rsa_key = paramiko.RSAKey.from_private_key_file(self.rsa_key_path)
		self.client_ssh = paramiko.SSHClient()
		self.client_ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
		self.client_ssh.connect( hostname=self.host, username=self.username, pkey=rsa_key )
		
	def close_ssh_connection(self):
		'''close the ssh connection'''
		self.client_ssh.close()

	def create_command(self, message):
		'''create a command to send to chat'''
		self.cmd = f'{self.base_cmd} {self.q_chat} "{message}"'

	def send_command(self):
		'''send a command to chat and returns std in/out/err'''
		stdin, stdout, stderr = self.client_ssh.exec_command( self.cmd )
		return stdin, stdout, stderr

	def set_APEX(self):
		'''set send message to APEX chatroom'''
		self.q_chat = self.APEX

	def set_DTI(self):
		'''set send message to DTI chatroom'''
		self.q_chat = self.DTI