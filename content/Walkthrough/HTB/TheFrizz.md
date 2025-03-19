---
title: TheFrizz
draft: false
tags:
---
Machine: https://app.hackthebox.com/competitive/7/overview

---
# Enumeration
## Port Scaning
- Using [[content/Tools/Activas/3. Escaneo de puertos/nmap|nmap]] in order to get the service and versions running in each port
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.60
nmap -p22,53,80,88,135,139,389,445,464,593,636,3268,3269,9389 -sCV --min-rate 5000 -n -Pn -vvv 10.10.11.60 -oN Targeted -oX Targeted.xml
```
>[!example]- Result
>![[Pasted image 20250319143456.png]]

Domain: `frizz.htb`
hostname: `FRIZZDC`
## DNS
- Using [[dig]] we can perform a DNS transfer but doesnt work
```bash
dig axfr 10.10.11.60
```

## LDAP
- We cant enumerate using ldap protocol because null session is not enabled
```bash
ldapsearch -H ldap://10.10.11.60 -x -s base
ldapsearch -H ldap://10.10.11.60 -x -b 'DC=frizz,DC=htb'
```
>[!example]- Result
>![[Pasted image 20250319144454.png]]

## SMB
- As null session is desabled we can do nothing
```bash
crackmapexec smb 10.10.11.60 -u '' -p ''
```
>[!example]- Result
>![[Pasted image 20250319144806.png]]

## Kerberos
- We can enumerate valid usernames using [[kerbrute]], we dont find nothing interesting
```bash
kerbrute_linux_amd64 userenum --dc frizz.htb -d frizz.htb /usr/share/SecLists/Usernames/xato-net-10-million-usernames.txt
```
>[!example]- Result
>![[Pasted image 20250319145902.png]]

## HTTP
- Getting technologies running using [[wappanalyzer]] and [[whatweb]]
```bash
whatweb http://frizzdc.frizz.htb
```
>[!example]- Result
>![[Pasted image 20250319150127.png]]
>![[Pasted image 20250319150223.png]]

- Checking the web side we can see the version of the platform, and is vulnerable to LFI: [CVE-2023-34598](https://github.com/Zer0F8th/CVE-2023-34598)
>[!example]- Result
>![[Pasted image 20250319153416.png]]

- we can check if this web is vulnerable researching this file `gibbon.sql`
>[!example]- Result
>![[Pasted image 20250319153956.png]]

- lets try this PoC
```bash
python3 CVE-2023-34598.py scan http://frizzdc.frizz.htb/Gibbon-LMS/
```
>[!example]- Result
>![[Pasted image 20250319154112.png]]

