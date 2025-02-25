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

