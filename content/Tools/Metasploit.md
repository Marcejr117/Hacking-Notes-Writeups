herramienta que permite ejecutar scripts sobre equipos victima
se puede usar en varios campos como por ejemplo:
- [[smb]] #EnumSMB_Metasploit 


---
para hacer uso de los exploits de msf, necesitamos usar
```bash
service postgresql start && msfconsole
```
luego para hacer uso de los modulos
```bash
use {nombre del exploit "auxiliary/scanner/smb/smb_version"}
```
usando el "Tab" podemos ir buscando, si hacemos uso de un exploit y no sabemos usarlo podemos escribir `show options`

![[Pasted image 20231115124747.png]]
ahora usamod `set` para configurar el exploit
```shell
set [nombre] [valor]
```

para correr el exploit usamod
```bash
run
```
o 
```shell
exploit
```


- Encontrar vulnerabilidades
```msfconle
search [software]
```
![[Pasted image 20231207172203.png]]


- para tener varias sesiones de MSF console usamos:
	Puedes ver las sesiones existentes con el comando sessions -l y crear una nueva sesión con el comando sessions -i. También puedes usar el comando sessions -r para reiniciar una sesión existente o el comando sessions -x para eliminar una sesión no deseada.
	![[Pasted image 20231215031311.png]]
	

- para ver los privilegios que tenemos en windows usando meterpreter:
```bash
getprivs
```
![[Pasted image 20231215031258.png]]
- migrar a un poceso distinto para obtener sus privilegios 
```shell
migrate [PID]
```
- escalar de privilegios de forma facil (no siempre funciona)
```meterpreter
getsystem
```
