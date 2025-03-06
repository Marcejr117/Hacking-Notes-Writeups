---
title: TimeLapse
draft: false
tags:
---
![[Timelapse.png|450]]![[Pasted image 20250306110638.png|200]]
Machine: https://app.hackthebox.com/machines/452

# Enumeration
## Port Scanning
- Getting the services and versions running 
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.152 -oG allPorts
```
>[!example]- Result
>![[Pasted image 20250306111155.png]]

```bash
nmap -p53,88,135,139,389,445,464,593,636,3268,3269,5986,9389,49667,49673,49674,49693,49719,55625 -sCV -n -Pn --min-rate 5000 10.10.11.152 -oN Targeted
```
>[!example]- Result
>![[Pasted image 20250306111525.png]]

Name: `dc01.timelapse.htb`

## LDAP
- using [[ldapsearch]] in order to get all available information without credentials
```bash
ldapsearch -H ldap://10.10.11.152 -x -s base
```
>[!example]- Result
>![[Pasted image 20250306113215.png]]

- now using each naming context, but nothing
```bash
ldapsearch -H ldap://10.10.11.152 -x -b 'DC=timelapse,DC=htb'
```
>[!example]- Result
>![[Pasted image 20250306113701.png]]

## SMB
- Using [[smbclient]] we can get a list of shares using a null session
```bash
smbclient -L //10.10.11.152/ -N
```
>[!example]- Result
>![[Pasted image 20250306114609.png]]

- now using [[smbmap]] we can see the access rights 
```bash
smbmap -H 10.10.11.152 -u 'none'
```
>[!example]- Result
>![[Pasted image 20250306114703.png]]

- lets enumerate this resource 
```bash
smbclient //10.10.11.152/Shares -U 'none' -N
```
>[!example]- Result
>![[Pasted image 20250306120432.png]]

- we got this files
```smbClient
mget *
```
>[!example]- Result
>![[Pasted image 20250306120853.png]]

- if we list the content of the `zip` file we found a `.pfx`
```bash
7z l rm_backup.zip
```
>[!example]- Result
>![[Pasted image 20250306122748.png]]

