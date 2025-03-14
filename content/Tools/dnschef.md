---
title: dnschef
draft: false
tags:
---

Es una herraminta para hacer dns proxy, util cuando por ejemplo un servidor DNS no nos esta respondiendo y una herramienta necesita conectar a un servidor dns

Esta herramienta se uso en: [[DC01]]
```bash
git clone https://github.com/iphelix/dnschef.git
cd dnschef
sudo python3 dnschef.py --fakeip 192.168.1.35 &
```
