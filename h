warning: CRLF will be replaced by LF in server/Scripts/pcr_complete.py.
The file will have its original line endings in your working directory.
[1mdiff --git i/server/Scripts/pcr_complete.py w/server/Scripts/pcr_complete.py[m
[1mindex c4b0877..ed2bfd8 100644[m
[1m--- i/server/Scripts/pcr_complete.py[m
[1m+++ w/server/Scripts/pcr_complete.py[m
[36m@@ -8,7 +8,7 @@[m [msys.path.append('../Crucible')[m
 from Crucible import Crucible[m
 from Jira import Jira[m
 [m
[31m-key = 'WAM-943'[m
[32m+[m[32mkey = 'UD-6661'[m
 [m
 [m
 # create auth header[m
[36m@@ -32,7 +32,7 @@[m [mif crucible_id['status']:[m
 	print('number_of_passes:', number_of_passes)[m
 [m
 	[m
[31m-	# jira.set_pcr_complete(key=key, cred_hash=cred_hash)[m
[32m+[m	[32mjira.set_pcr_complete(key=key, cred_hash=cred_hash)[m
 else:[m
 	print('no crucible id found')[m
 [m
