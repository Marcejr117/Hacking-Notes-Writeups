---
title: SoulMate
draft: false
tags:
---
![[../../../assets/Pasted image 20250907092555.png]]

Machine: 

# Information gathering
## Port scanning
- Lets do a [[../../../Tools/Activas/3. Escaneo de puertos/nmap|nmap]] scan to get the open ports
```bash
nmap -p- -sS -Pn -n --min-rate 5000 10.10.11.86
nmap -p22,80,4369 -sCV -Pn -n --min-rate 5000 10.10.11.86 -vvv
```
>[!example]- Show
>![[../../../assets/Pasted image 20250907092927.png]]

## Web Enumeration
- There are a HTTP port open so lets enumerate the web service, in order to know the tecnologies running we can use [[../../../Tools/Pasivas/Obtencion de informacion/1. Reconocimiento web/whatweb|whatweb]] & [[../../../Tools/wappanalyzer|wappanalyzer]]
```bash
whatweb -a 3 http://soulmate.htb/
```
>[!example]- Show
>![[../../../assets/Pasted image 20250907093404.png]]
>![[../../../assets/Pasted image 20250907093526.png]]

- The home page show some names:
>[!example]- Show
>![[../../../assets/Pasted image 20250907093701.png]]

- We can register and login `/register.php`, `/login.php`
>[!example]- Show
>![[../../../assets/Pasted image 20250907093736.png]]

