#!/usr/bin/python3

import os
import base64

import AutomationBot

automationBot = AutomationBot.AutomationBot(is_beta_week=1, is_qa_pcr=1, beta_stat_ping_now=0, debug=1, merge_alerts=0)
automationBot.update_jira()