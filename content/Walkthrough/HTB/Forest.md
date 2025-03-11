---
title: Forest
draft: false
tags:
---

![[Forest.png]]

Machine: https://app.hackthebox.com/machines/212

---
# Enumeration
## Port Scanning
- Getting open ports as well as service and version running on this ports
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.10.161
```
```bash
nmap -p53,88,135,139,389,445,464,593,636,3268,3269,5985,9389,47001 -sVC -n -Pn --min-rate 5000 10.10.10.161 -oN Targeted
```
>[!example]- Result
>![[Pasted image 20250311232329.png]]

Domain Name: `htb.local`
Host Name: `FOREST`
SMB guest account support

## LDAP
- Lets try to get all available information without credentials
```bash
ldapsearch -H ldap://10.10.10.161 -x -s base
```
>[!example]- Result
>![[Pasted image 20250311232909.png]]
```bash
ldapsearch -H ldap://10.10.10.161 -x -b 'DC=htb,DC=local'
```
>[!example]- Result
>![[Pasted image 20250311233056.png]]
>This message make me sense about a [forest structure](https://academy.hackthebox.com/module/74/section/700)
>

