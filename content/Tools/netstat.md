nos permite ver que puertos están abiertos en nuestro pc 
```bash
netstat -tulpn
			```
- **-t**: Muestra las conexiones TCP.
- **-u**: Muestra las conexiones UDP.
- **-l**: Muestra los programas que escuchan en los puertos.
- **-p**: Muestra los programas asociados con las conexiones.
- **-n**: Muestra las direcciones IP y números de puerto en formato numérico.
nos muestra:![[Pasted image 20230919195632.png]]
que por ejemplo en este caso el puerto "5432" lo suele usar postgress por ello es posible que tengamos una base de datos en sql
