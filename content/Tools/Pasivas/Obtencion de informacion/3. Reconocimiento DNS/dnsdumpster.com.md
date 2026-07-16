muestra la misma información que [[DNSrecon]] pero mas organizada
```url
https://dnsdumpster.com/
```
![[Pasted image 20231016120146.png]]
![[Pasted image 20231016120228.png]] : encabezados http
![[Pasted image 20231016120244.png]] :intentar transferencia de zona
![[Pasted image 20231016120321.png]] : ver la traza que tiene la dirección (ver por donde pasa ) usaando MTR
![[Pasted image 20231016120608.png]] : ver los host que comparten este servidor dns (es util por si sabemos si este servidor dns es particular y asi podemos intentar atacarlo)
![[Pasted image 20231016120834.png]] : Buscar el rango de IPs  consecutivas de forma pasiva
![[Pasted image 20231016120908.png]] : hace un escaneo de puertos a ese servidor de forma activa


#MTR: MTR es una herramienta de diagnóstico de red que combina la funcionalidad de los programas traceroute y ping en una sola herramienta. Se utiliza para rastrear la ruta de los paquetes de red y medir el tiempo que tardan en llegar a su destino. MTR es una herramienta útil para diagnosticar problemas de red, como latencia, pérdida de paquetes y congestión