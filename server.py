import subprocess
import sys
import os

p = subprocess.Popen([f'python server'] + sys.argv[1:])
p.wait()