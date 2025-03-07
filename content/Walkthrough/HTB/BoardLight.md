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

![[Pasted image 20250307145046.png]]

