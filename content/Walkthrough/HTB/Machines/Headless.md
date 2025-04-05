Hacemos un scaneo con nmap y vemos que tenemos 2 puestos abiertos
![[Pasted image 20240419161044.png]]
podemos ver que las cabezeras de la conexion con el puerto 5000 tenemos un servidor corriendo con este servicio (Werkzeug/2.2.2 Python/3.11.2)
![[Pasted image 20240419161221.png]]

si hacemos fuerza bruta para encontrar nuevos direcotorios vemos dos nuevos
```bash
dirb http://10.10.11.8:5000/
```
![[Pasted image 20240419165922.png]]

vamos a ver el de support y vemos que tenemos un formulario, vamos a probar varias cosas en los campos de texto
