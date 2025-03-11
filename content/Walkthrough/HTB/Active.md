---
title: Active
draft: false
tags:
---
![[Active.png]]

Machine: https://app.hackthebox.com/machines/148

# Enumeration
## Port Scanning
- Getting the open ports using [[content/Tools/Nmap|Nmap]]
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.10.100
```

- Enumerating service and versions, as well running some common scripts
```bash
nmap -p53,88,135,139,389,445,464,593,636,3268,3269,5722,9389 -sCV -n -Pn --min-rate 5000 10.10.10.100 -oN Targeted
```
>[!example]- Result
>![[Pasted image 20250311003834.png]]

Domain name: `active.htb`
Windows server Version: `windows_server_2008:r2:sp1` (old)

## LDAP
- We can use [[ldapsearch]] in order to collect some info (as we can stablish a connection, because we need valid credentials, we can continue with the enumeration)
```bash
ldapsearch -H ldap://10.10.10.100 -x -s base
```

DC Name: `dc$@ACTIVE.HTB`

## SMB
- Lets try to use a null session to get info using [[smbclient]]
```bash
smbclient -L //10.10.10.100 -N
```
>[!example]- Result
>![[Pasted image 20250311005443.png]]

- In order to read the folder permisions we can user [[crackmapexec]] or [[tools/nxc]]
```bash
crackmapexec smb 10.10.10.100 -u '' -p '' --shares -d active.htb
```
>[!example]- Result
>![[Pasted image 20250311010214.png]]

- lets go into this folder
```bash
smbclient //10.10.10.100/Replication -N
```
>[!example]- Result
>![[Pasted image 20250311010347.png]]

Looks like we have a replication of the `SYSVOL` folder