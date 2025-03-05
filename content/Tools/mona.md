es un modulo de [[Immunity Debugger]] que nos permite encotrar bad chars entre otras cosas

https://github.com/corelan/mona/blob/master/mona.py

instalacion
![[Pasted image 20241116130231.png]]

uso 
![[Pasted image 20241116130309.png]]

para trabajar mejor con mona podemos crearnos un directorio de configuración (yo suelo poner una carpeta compartida por smb con la maquina atacante) asi evito mover luego los archivos
```bash
!mona config -set workingfolder \\192.168.1.45\smbfolder
```
![[Pasted image 20250305192035.png]]
