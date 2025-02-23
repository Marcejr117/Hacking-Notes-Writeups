
- hacemos un escaneo de puertos con nmap y vemos que tenemos 3 puertos abiertos 21,22,53:
![[Pasted image 20240416005753.png]]
![[Pasted image 20240416005810.png]]
![[Pasted image 20240416005828.png]]

- vemos que el servidor ftp tiene arrchivos que se pueden ver con root, si los vemos tenemos que estamos ante una maquina openWRT (como los routers), uno de los archivo es un backup del router y vemos que tiene lo siguiente de informacion relevante
![[Pasted image 20240416010059.png]]
	usuario: netadmin
![[Pasted image 20240416010216.png]]
	esto se ve muy interesante si en el equipo este archivo se ejecuta como root

![[Pasted image 20240416010755.png]]
	tenemos una pass: VeRyUniUqWiFIPasswrd1!

![[Pasted image 20240416011822.png]]
	tenemos un correo: samantha.wood93@wifinetic.htb

![[Pasted image 20240416011923.png]]
	otro correo: olivia.walker17@wifinetic.htb, management@wifinetic.htb
![[Pasted image 20240416014325.png]]
	un dominio y un correo

- vamos a poner en /etc/hosts el dominio, esto lo hacemos para intentar hacer una transferencia de zona y de estaa forma ver si tiene algun subdominio (ya que el puerto 53 es un servidor dns), en la seccion de "answered serction" debe aparecer en caso de haber mas subdominios, en este caso no hay

```bash
dig asxf @10.10.11.247 wifinetic.htb
```

- sabiendo que tenemos una contraseña vamos a hacer fuerza bruta con [[crackmapexec]]

```bash
poetry run crackmapexec ssh 10.10.11.247 -u /usr/share/wordlists/rockyou.txt -p 'VeRyUniUqWiFIPasswrd1!' --continue-on-success
```

- ahora tenemos el usuario "netadmin" 
```bash
sshpass -p 'VeRyUniUqWiFIPasswrd1!' ssh netadmin@10.10.11.247
```

![[Pasted image 20240416023123.png]]

- ahora vamos a buscar binario que podamos ejecutar y root sea el dueño
```bash

```