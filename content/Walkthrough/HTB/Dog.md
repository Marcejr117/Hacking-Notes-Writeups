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

- There is a `.git` direcotory so lets download and check it
