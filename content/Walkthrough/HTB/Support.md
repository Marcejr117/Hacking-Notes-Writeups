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
![[Pasted image 20250224174835.png]]

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
![[Pasted image 20250224184040.png]]
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





