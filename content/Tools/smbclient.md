Herramienta que nos permite conectar a un servidor samba desde el terminal
Mas ejemplos: #EnumSMB_smbclient 
##### Ejemplos

---
```bash
smbclient -L [nombre NetBIOS / IP] -N 
```
- `-L`: lista los host del equipo 
- `-N`: entrar sin contraseña 


##### Outputs

---
![[Pasted image 20231115131456.png]]
- `IPC$`: nos dice que hemos establecido conexión de sesión nula, lo cual nos permite: 
	- enumerar nombres de cuentas del dominio
	- comparticiones de la red
