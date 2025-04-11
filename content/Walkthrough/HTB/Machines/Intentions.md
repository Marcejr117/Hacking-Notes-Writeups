---
title: Intentions
draft: false
tags:
---
![[Intentions.png]]
Machine: https://app.hackthebox.com/machines/Intentions

--- 
# Reconnaissance
## Port Scanning
- As always lets use [[content/Tools/Activas/3. Escaneo de puertos/nmap|nmap]] in order to get the open port and versiones
```bash
nmap -p- -sS -n -Pn 10.10.11.220 --min-rate 5000
nmap -p22,80 -sVC -n -Pn 10.10.11.220 --min-rate 5000
```
>[!example]- View
>![[Pasted image 20250411230452.png]]






----
# Cosas  para analizar
- De donde sale esto: `')/**/UNION/**/SELECT/**/1,2,3,4,5--`
