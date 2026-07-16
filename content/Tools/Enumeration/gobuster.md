nos permite mediante fuerza bruta ver directorios dentro del dominio
- `sudo gobuster dir -u http://10.10.11.204:8080 -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20`

muy util con la busqueda de subdominios
--append-domain añade el dominio del sitio web al resultado del escaneo de subdominios y directorios.
```bash
gobuster vhost --url http://cereal.ctf:44441/ --wordlist /usr/share/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -t 20 --append-domain
```
qutiar los codigos de estado
![[Pasted image 20250123164957.png]]
por extension
![[Pasted image 20250123165038.png]]
