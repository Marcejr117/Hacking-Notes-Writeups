CrackMapExec es una herramienta de hacking ético que permite realizar movimientos laterales dentro de una red local, aprovechando las vulnerabilidades de los sistemas operativos Windows. Con CrackMapExec, se puede escanear la red, enumerar los recursos compartidos, obtener información sobre los usuarios y grupos, ejecutar comandos remotos y mucho más ([[Exploiting WinRM]], [[Pass-The-Hash Attacks]]), se suele usar junto con  [[evil-winrm]]

(sobre todo es para maquinas windows)

![[Pasted image 20231214215054.png]]
la aplicacion permite estos 4 protocolos, listar todos los comandos para un protocolo
```bash
crackmapexec smb -L
```

listar comandos que tiene un procolo
```bash
crackmapexec smb --help
```
activar RDP
```bash
crackmapexec smb 10.4.26.151 -u administrator -р "sebastian" -M rdp - o ACTION=enable
```


---
Ejemplo:
```bash
crackmapexec winrm 10.2.29.206 -u administrator -p /usr/share/metasploit-framework/data/wordlists/unix_passwords.txt
```
![[Pasted image 20231214221127.png]]

instalar desde python
![[Pasted image 20240119133013 1.png]]
instalar desde la fuente
![[Pasted image 20240119133028 1.png]]
	para ejecutarlo
	![[Pasted image 20240119133135 1.png]]

ver los archivos compartidos
![[Pasted image 20240119133208 1.png]]
`--shares`

```bash
apt-get install -y libssl-dev libffi-dev python-dev build-essential
git clone --recursive https://github.com/byt3bl33d3r/CrackMapExec
cd CrackMapExec
poetry install
poetry run crackmapexec
```

### **La unica solucion que he encontrado**
inslamos `snap` y luego el paquete:
```bash
sudo apt install snapd
sudo snap install crackmapexec
```
luego agregamos la ruta `/snap/bin` en el path
```bash
/home/jr117/miVenv/bin:/usr/local/sbin:/usr/sbin:/sbin:/opt/kitty/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games:/opt/nvim/nvim-linux64/bin:/snap/bin:/home/jr117/.fzf/bin:/root/.local/bin
```
y reiniciamos la termina y ya deberia ir
![[Pasted image 20240511174712.png]]
