# Enumeración
Iniciamos con una enumeración de puertos 
```bash
sudo nmap -p- -sS -Pn -n --min-rate 5000 -oG allPorts -open -vvv
```
![[Pasted image 20241225152427.png]]

Después de un buen rato analizando la pagina web (y no encontrar nada), decido hacer una enumeracion de puertos UDP
```bash
sudo nmap -p- -sU -Pn -n --min-rate 5000 -oG allPortsUDP 10.10.11.48 -open -vvv | grep -v filtered
```
![[Pasted image 20241225153242.png]]

Hemos encontrado un puerto asique vamos a hacer un escaneo de servicio y su version
```bash
sudo nmap -p161 -sU -sVC -Pn -n --min-rate 5000 -oG TargetedUDP 10.10.11.48 -open -vvv
```
![[Pasted image 20241225154411.png]]

Al parecer esta haciendo uso de `snmp` (Info: [Link](https://book.hacktricks.xyz/es/network-services-pentesting/pentesting-snmp)), vamos a realizar una enumeración mas exhaustiva usando [[content/Tools/Activas/3. Escaneo de puertos/nmap|nmap]]
```bash
nmap -sUV -p161 --script=snmp\* 10.10.11.48
```
![[Pasted image 20241225204711.png]]

tenemos informacion interesante pero aun no es sufiente, ahora con [[../../../Tools/snmpwalk - snmpbulkwalk]] (la version que vamos a usar es la 1 ya que no tenemos credeciales para autenticarnos en la version 3)
```bash
nmpwalk -v 1 -c public 10.10.11.48 .1
```
- `-v 1`:  Especifica la version de snmp que vamos a usar
- `-c public`: Especifica el "Community String"
- `.1`: Enumera todos los nodos
![[Pasted image 20241225205323.png]]

Al parecer tenemos un correo electronico del servidor, asim como un nombre de dominio (que obviamente es la maquina web de antes) pero esta vez nos ha dado información sobre un posible servicio detrás de la web, y resulta que "deloradius server" se encuentra detras del direcotirio `deloradius` (esto no están el los wordlist típicos es algo que he intuido), vamos a buscar mas directorio detrás de este
```bash
gobuster dir -u underpass.htb/daloradius/ -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-big.txt -t 200 --add-slash
```
![[Pasted image 20241225211421.png]]

despues de estar buscando he encontrado este recurso
![[Pasted image 20241225212424.png]]
esto nos redirige y nos da un panel de login
![[Pasted image 20241225212540.png]]
# Explotacion

Como estamos usando "daloRADIUS" vamos a intentar usar las credenciales por defecto `administrator:radius`
![[Pasted image 20241225214012.png]]

Revisando la web tenemos mas credenciales ![[Pasted image 20241225214056.png]]
	el hash: ![[Pasted image 20241225214537.png]]
```bash
john hash --format=raw-md5 -w:/usr/share/wordlists/rockyou.txt
```

ahora podemos intentar usar estos credenciales para ssh (`svcMosh:underwaterfriends`)
```bash
ssh svcMosh@10.10.11.48
```
![[Pasted image 20241225214906.png]]

# Escalada de privilegios
Despues de enumerar las posibles vias vemos que podemos ejecutar como sudo este comando (y sin el uso de password)
![[Pasted image 20241225215853.png]]

Creamos un servidor de mosh(que es como un entorno de ssh) pero lo ejecutamos con root, luego esto nos dara unos credenciales
