---
title: Usage
draft: false
tags:
---

![[Usage.png]]

Machine: https://app.hackthebox.com/machines/Usage

---
# Enumeration
## Port  Scanning
- Lets start with the classical port scanning and get the service and version running, using  [[content/Tools/Activas/3. Escaneo de puertos/nmap|nmap]]
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.18
nmap -p22,80 -sVC -Pn -n --min-rate 5000 22,80 10.10.11.18
```
>[!example]- Result
>![[Pasted image 20250320105013.png]]

## Web Site
- Lets get the tecnologies running on this web page using [[wappanalyzer]] and [[whatweb]]
```bash
whatweb http://usage.htb/
```
>[!example]- Result
>![[Pasted image 20250320105352.png]]
>![[Pasted image 20250320105431.png]]

- the web side allow us to register and login,