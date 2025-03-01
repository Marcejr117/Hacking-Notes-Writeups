---
title: Sauna
draft: false
tags:
---
![[Pasted image 20250301142320.png]]
Machine: https://app.hackthebox.com/machines/Sauna
# Enumeration
## Services & Versions
- Ports discovery
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.10.175 -oG allPorts
```
>[!example]- Result
![[Pasted image 20250301141118.png]]

- versions discovery
```bash
nmap -p53,80,88,135,139,389,445,464,593,636,3268,3269,5985,9389,49668,49673,49674,49675,49689,49697 -sVC -n -Pn --min-rate 5000 -oN Targeted
```
>[!example]- Result
>![[Pasted image 20250301141750.png]]

*Domain:* "Egotistical-bank.local"

## Web Page
### Enumerate Content

### Directory Enumeration
- we can use [[gobuster]] to enumerate more web pages and resources


## Kerberos
- Valid users enumeration
```bash
kerbrute_linux_amd64 userenum -d EGOTISTICAL-BANK.LOCAL --dc 10.10.10.175 /usr/share/SecLists/Usernames/xato-net-10-million-usernames.txt -t 50
```

