mas ejemplo: [[6. SQL]]

---
- Conectar
	```bash
	mysql -h 192.71.145.3 -u root
	```
	- -h: host
	- -u: usuario
- Leer archivos del sistema en Mysql
	```Mysql
	select load_file("/etc/shadow");
	```
	![[Pasted image 20231130132723.png]]
