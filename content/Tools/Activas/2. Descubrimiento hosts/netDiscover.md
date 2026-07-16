nos muestra los equipos que hay conectados a nuestra red
```bash
netdiscover
```
![[Pasted image 20231030083958.png]]
Para mas precision podemos especificar la mascara de red en la que queremos trabajar usando
- `-r <mascara>`
```bash
sudo netdiscover -r 192.168.1.0/24
```
![[Pasted image 20231030084226.png]]
lo cual tarda mucho menos.
Algo a destacar es que esta herramienta no hace uso del protocolo ICMP como nmap (ping) sino que hace uso de las tablas ARP que estan almacenadas en los equipos
