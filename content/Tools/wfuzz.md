herramienta para fuzear en cualquier metodo (post put get...)
```bash
wfuzz -c -t 20 -w /usr/share/SecLists/Discovery/DNS/subdomains-top1millon-5000.txt -H "Host: <FUZZ.tinder.com>"<http://tinder.com> --hc=403 
```

- `--hc` es para ocultar los resultados que te dan un codigo de estado 403
- `--hh`: ocualta x caracters

- FUZZ es donde quieres sustituir el payload (palabras)
![[Pasted image 20240115224530 1.png]]

otro ejemplo
```bash
 wfuzz -c -t 200 --hl=7 -z range,1-65535 "http://172.17.0.2/utility.php?url=http://127.0.0.1:FUZZ"
```
- --hl=7 -> quita los resultados con 7 lineas
- -z -> nos permite especificar el contenido del `FUZZ` en este caso es un rango de 1 al 65535
	![[Pasted image 20240903130845.png]]
