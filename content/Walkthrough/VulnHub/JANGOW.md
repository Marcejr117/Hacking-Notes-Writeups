Debemos poner las dos maquinas en modo privado
![[Pasted image 20231007192248.png]]
hacemos un escaneo de la red local con [[arp-scan]]
```bash
sudo arp-scan -l
```
![[Pasted image 20231007192302.png]]
hacemos ping a la ultima
```bash
ping 192.168.1.200
```
![[Pasted image 20231007192316.png]]
tenemos conexión con una maquina Linux por lo cual es esa maquina, ahora vamos a hacer un escaneo de puertos con [[Anotaciones/Herramientas/Nmap]]
```bash
sudo nmap -p- -sS 192.168.1.200 --min-rate 5000 -n -Pn -oG allports
```
ahora vamos a hacer un analisis mas exhaustivo de cada uno
```bash
sudo nmap -p53,8090,21178,25203 192.168.1.200 -sCV --min-rate 5000 -vvv
```
![[Pasted image 20231007193540.png]]
los otros puertos no los reconoce, vamos a analizar los servicios, vemos que hay un servicio llamado [[]]