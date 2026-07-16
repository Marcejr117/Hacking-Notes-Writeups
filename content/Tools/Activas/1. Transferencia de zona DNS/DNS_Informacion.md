Servidor de nombres de dominio, guarda registros de que ip tiene cada dominio, esto puede ser útil cuando un dominio pasa por un proxy y no se sabe cual es la dirección real del dominio final. de esta forma en el dns podemos llegar a obtener la ruta real con la que enlaza.

#### Tipos de registros
![[Pasted image 20231024173639.png]]

#### Consultas DNS

![[Pasted image 20231024173932.png]]
 "Objetivo de esto es ver si el servidor DNS nos puede dar los registros de un Dominio en especifico" entes solo nos daba los registros MX y A o AAAA o registros a los que antes no teniamos acceso
#### Zona de transferencia DNS
formas de obtener mas registro de un dominio en particular
"Zone file" es un archivo que contiene los registros de los dominios
cuando esto pasa el DNS activa una funcionalidad llamda Zone transfer
si el servidor DNS esta mal configura los atacantes pueden abusar del protocolo, y transferir registros del DNS principal a otro servidor DNS
![[Pasted image 20231024174502.png]]


#### Prueba practica
usando [[Anotaciones/Herramientas/Activas/1. Transferencia de zona DNS/dnsenum|dnsenum]] podemos ver los dominios de zonetransfer.me y vemos que hay unos subdominios que los ha traido de otros servidores dns 
![[Pasted image 20231024185122.png]]
uno de los interestantes es "dc-office.zonetransfer.me" el cual como viene de otro servidor dns seguramente interno, deberemos agregarlo al archivo hosts para poder verlo en el navegador

