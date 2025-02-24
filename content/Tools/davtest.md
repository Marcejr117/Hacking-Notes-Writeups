es un escáner WebDAV que envía archivos exploit al servidor WebDAV y automáticamente crea el directorio y carga archivos de diferentes formatos. La herramienta también trató de ejecutar los archivos cargados y nos da una salida de archivos ejecutados con éxito.

Para mas ejemplos: [[Exploiting Microsoft IIS WebDAV]]

---
```bash
davtest -url http://10.2.31.23/webdav/ -auth bob:password_123321
```
el programa comprueba los permisos que tenemos sobre el webdav cargarndo y ejecutando archivos en el servidor, finalmente nos da un sumario donde en este caso, vemos que ha podido subir y ejecutar
![[Pasted image 20231212194909.png]]
