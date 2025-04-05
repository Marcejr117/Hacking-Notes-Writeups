Iniciamos con nuestro reconocimiento con [[Anotaciones/Herramientas/Nmap|Nmap]]
```bash
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 e2:5c:5d:8c:47:3e:d8:72:f7:b4:80:03:49:86:6d:ef (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBAyYzjPGuVga97Y5vl5BajgMpjiGqUWp23U2DO9Kij5AhK3lyZFq/rroiDu7zYpMTCkFAk0fICBScfnuLHi6NOI=
|   256 1f:41:02:8e:6b:17:18:9c:a0:ac:54:23:e9:71:30:17 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP8A41tX6hHpQeDLNhKf2QuBM7kqwhIBXGZ4jiOsbYCI
80/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.52
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Did not follow redirect to http://permx.htb
Service Info: Host: 127.0.1.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Vamos a revisar la web y no vemos nada a simple vista, si enumeramos directorios no vemos nada, pero si enumeramos subdominios encontramos uno (lo agregamos al `/etc/hosts`)
```bash
gobuster vhost --url http://permx.htb/ -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -t 80 --append-domain | grep -v 302
```
![[{E273321A-B411-4093-9DC0-25F77EB49E1C}.png]]
vamos a investigarlo, para ello vamos a enumrar directorios y vemos esta info interesante
- `http://lms.permx.htb/certificates/`:
	- es un panel de autenticacion
- `http://lms.permx.htb/certificates/`:
	- documentacion de la tecnologia que usa la web (usa `Chamillo 1.11`)
Buscamos exploits para esa version del LMS (learning management and collaboration system), [Link](https://github.com/m3m0o/chamilo-lms-unauthenticated-big-upload-rce-poc) Vamos a usarlo
![[{2FBAD3E2-BB8C-437C-8FB4-57C77ADD6135}.png]]
> [!Note] - Funcionamiento
> Esta vulnerabilidad es devida a que hay un endpoint `/main/inc/lib/javascript/bigupload/inc/bigUpload.php?action=post-unsupported` donde por POST podemos pasarle un archivo y se almacena en se endpoint
> ![[Pasted image 20241101190555.png]]


ahora tenemos esta webshell
![[{30FA96AD-C848-4DA8-93C2-CD4A3F241B14}.png]]

nos mandamos una revshell (se puede hacer desde el POC) y vamos a enumerar creadenciales del servidor (ruta: `var/www/chamilo`) (tambien podemos ir poco a poco buscando en lo archivos que es mejor)
```bash
find . -name \*conf\* -type f -exec grep pass {} \;
```

tenemos na pass vamos a probarla para alguno de los usuarios para ssh
```php
$_configuration['db_password'] = '03F6lY3uXAP2bkW8';

```
![[{42C87964-867C-4854-A6AC-7EA55C5369BC}.png]]

![[{1A13D1D3-1200-4858-B50D-44E2A988B3B8}.png]]
enumaramos y vemos que podemos ejecutar un script como root
![[{F9B5CFA3-BEF8-4122-A128-9F1E59DEE532}.png]]
![[{A8F52A5F-2E4F-4436-AE98-920704A67BE6}.png]]
el script no nos permite cambiar archivo fuera de nuestro home y tampoco podemos usar `..` pero si que podemos crear un enlace simbolico de por ejemplo el `passwd` y quitarle la password a root

![[Pasted image 20241101205702.png]]
![[Pasted image 20241101205734.png]]
ahora que no tiene pass vamos a entrar como root
![[Pasted image 20241101205807.png]]

