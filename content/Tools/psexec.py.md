Psexec.py es un script de Python que permite ejecutar comandos en un host remoto de Windows usando SMB/RPC.

mas uso: [[Exploiting SMB With PsExec]]

---
```bash
psexec.py Administrator@10.2.22.111 cmd.exe
```
![[Pasted image 20231213044909.png]]
nos devuelve una consola ya que hemos ejecutado cmd.exe
1. busca un direcotio donde pueda escribir
2. sube el payload
3. lo ejecuta
4. y devuelve el resultado
