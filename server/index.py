import subprocess
import sys
import os

PACKAGE_PARENT = '..'
SCRIPT_DIR = os.path.dirname(os.path.realpath(
    os.path.join(os.getcwd(), os.path.expanduser(__file__))))
sys.path.append(os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_PARENT)))


apps = ["cronIndex.py", "serverIndex.py"]

ps = []
for script in apps:
    p = subprocess.Popen(['python', script] + sys.argv[1:])
    ps.append(p)

for p in ps:
    p.wait()
