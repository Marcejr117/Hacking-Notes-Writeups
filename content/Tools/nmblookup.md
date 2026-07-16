
Herramienta para el cliente NetBios sobre el puerto 137, sobre TCP/IP busca nombre NetBIOS y los mapea en direcciones ip.
Ejemplo smb: #EnumSMB_nmblookup 
- opciones:
	- `-M|--master-browser`: Busca un navegador maestro buscando el nombre de NetBIOS con un tipo de 0x1d.
	- `-r|--root-port`: Especifica el puerto raíz
	- `-A|--lookup-by-ip`: Toma una dirección IP y realiza una consulta de estado de nodo en esta dirección
	- `-d|--debuglevel=DEBUGLEVEL`: Establece el nivel de depuración


![[Pasted image 20231115125928.png]]
cosas a destacar 
- podemos ver que hay varios grupos 
- vemos que hay un equipo con <20> lo cual indica que nos podemos conectar a ese mediante [[smbclient]]

Aquí tienes una tabla con algunos de los tipos de nombres NetBIOS más comunes:

|Sufijo Hexadecimal|Tipo de Nombre NetBIOS|
|---|---|
|`<00>`|[Estación de trabajo](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nbtstat)[1](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nbtstat)|
|`<01>`|[Navegador](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nbtstat)[1](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nbtstat)|
|`<03>`|[Mensajero](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nbtstat)[1](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nbtstat)|
|`<20>`|[Servidor](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nbtstat)[1](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nbtstat)|

