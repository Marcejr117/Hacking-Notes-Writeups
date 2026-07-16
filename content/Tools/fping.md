es una herramienta que nos permite automatizar script para ICMP
es decir podemos enviar un ping a varios hosts
```bash
fping -g 192.168.1.0/24 -a 2>/dev/null 
```
- `-g <IP>` nos crea una lista con todos los resultados, esto nos permite ir recorriendo toda la subnet
- `-a` muestra los resultados donde el dispotivos esta "alive"
- `2>dev/null` elimina todos los errores que puedean suceder como "Host Unreachable"

