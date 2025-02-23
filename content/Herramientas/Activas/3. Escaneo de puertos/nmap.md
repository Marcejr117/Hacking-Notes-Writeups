Notas:
- Cuando hacemos uso de esta herramienta debemos tener en cuanta si el sistema al que estamos haciendo tarjet es Windows o Linux ya que en Windows nos bloqueara las peticiones ICMP(Pings) entrantes y nos dara este error![[Pasted image 20231030085046.png]]
  para este caso podemos hacer uso de la flag
  - `-Pn`: esto lo que hace es evitar el descubrimiento de hosts y asumimos que el equipo esta encendido, util cuando hay un firewall o cuando nos estan bloqueando el ICMP


---
- FastScann:
  ```bash
  sudo nmap -p- --open -sS --min-rate 5000 10.10.11.204 -vvv -n -Pn
```
	- -sS: hace que el escaneo sea mas rapido y sigiloso ya que no finaliza las conexiones, por lo que hay menos transito
	- -n: Quitamos la resolution dns, para ir mas rapido
	- -Pn: Hacemos que no nos aplique HostDiscovery, a traves del protocolo arp (lo de que si una maquina no conocia a otra esta preguntaba a las de la red), es decir no hacemos ping a las maquinas para saber si estan activas
- SlowScann:
  ```bash
  sudo nmap -p _puertos_ -sCV --min-rate 5000 10.10.11.204
```
	- -sC: Ejecuta los scripts mas tipicos de nmap
	- -sV: detecta versión y servicios de los puertos
- http-enum:
  ```bash
  sudo nmap --script http-enum -p8080 10.10.11.204 -oN webScan
```
	- nos permite ver directorios dentro de esa direccion, mediante fuerza bruta
	- lo hace con un diccionario pequeño por lo que puede que no veamos nada
	- en ese caso debemos usar otras herramientas como [[dirbuster]],[[gobuster]]
* Enumerar maquinas:
  ```bash
  sudo nmap -sn 192.168.4.0/24
```
	* -sn, hace un ping a todo el rango de ip especificado
* Detectar OS:
  ```bash
  sudo nmap -O IP_Address
```
* enumerar todos los escripts de nmap
  ```bash
  ls /usr/share/nmap/scripts/ | grep "[filtro]"
```
![[Pasted image 20231128113207.png]]
- multiples ip
```bash
nmap 192.168.1.2,3,4,5,... {parametros}
```
![[Pasted image 20231208221406.png]]

---
- `-sT`:  Este parámetro indica que se realizará un escaneo de conexión TCP completa, lo que significa que Nmap intentará establecer una conexión con el puerto de destino para determinar si está abierto o cerrado
- `-sU`: Todos los puertos UDP
- `--script=firewalk`: https://nmap.org/nsedoc/scripts/firewalk.html
- `--traceroute`: te muestra los nodos por los que ha pasado el paquete
- `-A`: es como si usaramos -sVC -O
- `-sn`: nos permite ejecutar un escaneo de host de una subnet "192.168.1.0/24" sin hacer uno de puertos
- `-iL <archivo.txt>`: si tenemos un listado de ips podemos hacer el escaneo a todas a la vez
- `--script=smb*`= [[smb]]
- `--script=http*`= [[5. HTTP]]
---
outputs
- #tpcwrapped
	- cuando nos sale este servicio es que hay un firewall que esta filtrando los paquetes para que estos sean de una procedencia segura (https://superuser.com/questions/84421/what-does-it-mean-when-a-portscan-shows-a-port-as-tcpwrapped)

