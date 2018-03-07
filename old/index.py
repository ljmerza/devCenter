import subprocess
import sys


apps = ["cronIndex.py", "serverIndex.py"]

ps = []
for script in apps:
    p = subprocess.Popen(['python', script] + sys.argv[1:])
    ps.append(p)

for p in ps:
    p.wait()
