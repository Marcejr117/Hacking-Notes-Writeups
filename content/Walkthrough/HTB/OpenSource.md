---
title: OpenSource
draft: false
tags:
---
![[Pasted image 20250225205639.png]]

Machine: https://app.hackthebox.com/machines/471

# Enumeration
## Services / Versions
- As always, we use [[content/Tools/Activas/3. Escaneo de puertos/nmap|nmap]] to get service and version of the target
```bash
 sudo nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.164 -oG allPorts
```
>[!example]- Result
>![[Pasted image 20250225210256.png]]

- And a version enumeration and run some common scripts
```bash
sudo nmap -p22,80 -sVC -Pn -n --min-rate 5000 10.10.11.164 -oN Targeted
```
>[!Example]- Result
>![[Pasted image 20250225210750.png]]

## Web Service Enumeration

- In order to get knowledge of the target, we can use some tools to get info about the technologies used in the web side 
### [[whatweb]] / [[wappanalyzer]]
```
whatweb http://<ip>
```
>[!example]- Result
>![[Pasted image 20250225225016.png]]
>![[Pasted image 20250225225051.png]]

- so it using "werkzeug 2.1.2" we can try somethings like [bypass console PIN](https://www.daehee.com/blog/werkzeug-console-pin-exploit) because the Debug is enabled, but first we need to find a path traversal / LFI in order to get `uuid.getnode()` and `get_machine_id()` 
