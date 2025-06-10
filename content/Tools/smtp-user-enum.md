nos vale para enumerar usuarios con fuerza bruta sobre SMTP
![[Pasted image 20250210185254.png]]

- Cambiando el modo y aumentando el tiempo que tarda el server en contestar
```bash
smtp-user-enum -M VRFY -U footprinting-wordlist.txt -t 10.129.170.165 -w 20
```