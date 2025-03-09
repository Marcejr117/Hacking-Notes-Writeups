---
title: Dog
draft: false
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

- There is a `.git` direcotory so lets download and check it, but nothing especial
```bash
wget -r -np -nH --cut-dirs=1 -R "index.html*" http://10.10.11.58/.git/
```

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

