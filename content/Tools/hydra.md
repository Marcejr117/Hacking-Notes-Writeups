Es una herramienta de fuerza bruta que admite numeroso protocolos

Mas ejemplos: #EnumSMB_hydra, #ftp_hydra 

La sintaxis suele ser que las minusculas son los valores especificos, y las mayusculas para valores mas amplios como un wordlist

---
### Ejemplos
```bash
hydra -l admin -P [Wordlist] [IP] [Protocolo "smb/telnet/ssh/..."]
```
- -l: especificamos el usuario
- -P: Contraseñas con las que hacer fuerza bruta