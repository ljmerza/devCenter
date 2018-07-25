import subprocess
import sys


apps = ["server.cronIndex.py", "server.serverIndex.py"]

ps = []
for script in apps:
	args = ''.join(sys.argv[1:])
	command = f'python -m {script} {args}'
	print(command)
	p = subprocess.call(command)
	ps.append(p)

for p in ps:
	p.wait()
