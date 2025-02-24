Es un proxy que nos permite modificar los paquetes antes de mandarlos, y nos permite automatizar acciones repetitivas, se suele usar con foxyproxy.
- `burpsuite &> /dev/null & disown`
	- &>: redireccionamos todo el output que saldría en consola, para que no se muestre
	- &: hacemos que corra en un hilo, de esta manera no nos deshabilita la terminal
	- disown: nos permite cerrar la terminal sin que la aplicación se cierre
debemos activarlo y cuando tengamos la petición la cual vamos a ir modificando, la mandamos al repetir con `ctr + r` 


---
### Instalacion de certificado
- vamos a la pagina de burp
![[Pasted image 20240117154428 1.png]]
y descagarmos el certificado, y lo importamos
![[Pasted image 20240117154455 1.png]]
![[Pasted image 20240117154509 1.png]]
ya estaria
