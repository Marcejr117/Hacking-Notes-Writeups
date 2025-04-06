es una herramienta que nos permite ver que cadena o que procesos se ejecutan cuando ejecutamos un binario (ejemplo)
```bash
string welcome
```
![[Pasted image 20231221020155.png]]
vemos que ejecuta el comando setuid, ya que el archivo welcome se ejecuta con permisos de root, pero vemos que se ejecuta tambien otro comando (lo cual es interesante ya que es otro binario que a lo mejor podemos modificar)