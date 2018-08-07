#!/usr/bin/python3

import os
import base64

import AutomationBot

automationBot = AutomationBot.AutomationBot(
						is_beta_week=True, 
						is_qa_pcr=True, 
						beta_stat_ping_now=False, 
						debug=True, 
						merge_alerts=False
					)
automationBot.update_jira()
