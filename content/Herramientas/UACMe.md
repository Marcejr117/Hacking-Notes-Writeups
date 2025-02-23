es una herramienta de escalada de privilegios, que se aprovecha del UAC (User Access Control).
***Para que esta herramienta funcione debemos tener acceso a un usuario que se encuentre en el grupo de administrators***
```meterpreter
net localgroup administrators
```
https://github.com/hfiref0x/UACME?tab=readme-ov-file

para compilarlo

https://youtu.be/RXX0FHM9SEk?t=1302

hay que tener en cuenta que no tendremos los archivo binarios listos para ejecutar, los tendremos que compliar nosotros mismos, estan escritos en C, 

---
![[Pasted image 20231217024958.png]]
las keys se pueden ver en el desplegable
```shell
akagai64 [key (es la vulnerabilidad)] [param (es el payload que queremos ejecutar en el equipo)]
```
la key va a depender de la version del windows del equipo victima