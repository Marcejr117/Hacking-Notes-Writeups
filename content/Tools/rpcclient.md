Hace uso del protocolo #dcerpc, es una herramienta utilizada para probar la funcionalidad de MS-RPC en samba
Ejemplos de uso: #EnumSMB_rpcclient 
En la Shell que nos devuelve podemos hacer uso de multiples funcionalidades
![[Pasted image 20231115132838.png]]

Usos mas comunes:

|   |   |
|---|---|
|`srvinfo`|Server information.|
|`enumdomains`|Enumerate all domains that are deployed in the network.|
|`querydominfo`|Provides domain, server, and user information of deployed domains.|
|`netshareenumall`|Enumerates all available shares.|
|`netsharegetinfo <share>`|Provides information about a specific share.|
|`enumdomusers`|Enumerates all domain users.|
|`queryuser <RID>`|Provides information about a specific user.|

##### Ejemplos
---
```bash
rpcclient -U "" -N [ip]
```
- -U: especificamos el usuario
- -N: sin contraseña

