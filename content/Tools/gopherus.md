Nos permite crear un payload para explotar una base de datos dada, para mas info: [[3. Introducción al Pivoting]]

nos permite explotar el protocolo `gopher://` para enumerar (este protocolo nos permite enumerar bases de datos)

info: https://book.hacktricks.xyz/pentesting-web/ssrf-server-side-request-forgery#gopher
# Instalacion
repo: https://github.com/tarunkant/Gopherus
```bash
./install.sh
```

en mi caso despues de instalar necesite que python2.7 estubiera en otra ruta por lo cual cree un enlace simbolico
```bash
ln -s /usr/local/bin/python2.7 /usr/bin/python2
```
