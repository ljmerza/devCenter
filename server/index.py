import subprocess
import sys
import os



ps = []
p = subprocess.Popen([f'python cronIndex.py'] + sys.argv[1:])
ps.append(p)

p = subprocess.Popen([f'python serverIndex.py'] + sys.argv[1:])
ps.append(p)

for p in ps:
    p.wait()
