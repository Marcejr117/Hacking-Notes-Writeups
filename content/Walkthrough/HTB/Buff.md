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

- looks like this software version have a RCE vulnerability 