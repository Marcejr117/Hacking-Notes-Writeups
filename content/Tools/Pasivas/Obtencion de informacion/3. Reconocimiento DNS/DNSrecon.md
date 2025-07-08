This script provides the ability to perform:
- Check all NS Records for Zone Transfers.
- Enumerate General DNS Records for a given Domain (MX, SOA, NS, A, AAAA, SPF and TXT).
- Perform common SRV Record Enumeration.
- Top Level Domain (TLD) Expansion.
- Check for Wildcard Resolution.
- Brute Force subdomain and host A and AAAA records given a domain and a wordlist.
- Perform a PTR Record lookup for a given IP Range or CIDR.
- Check a DNS Server Cached records for A, AAAA and CNAME Records provided a list of host records in a text file to check.

```bash
dsnrecon.py -d dominio.com
```

![[Pasted image 20231016112339.png]]

```bash
dnsrecon -d inlanefreight.com -n ns.inlanefreight.com
```

---
para instalarlo descargamos el repositorio lo copiamos a /opt y luego lo ponemos en la zshrc
![[Pasted image 20231016113940.png]]
