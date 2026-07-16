Es una herramienta utilizada para extraer información de hosts de Windows y Samba. Utiliza las herramientas de Samba [[smbclient]], [[rpcclient]], [[net]] y [[nslookup]].
Ejemplos de uso: #EnumSMB_enum4linux 
Las características de `Enum4linux` incluyen
- Enumeración de recursos compartidos.
- Recuperación de la política de contraseña.
- Identificación del sistema operativo remoto.
- Detección si el host está en un grupo de trabajo o en un dominio.
- Listado de usuarios en hosts.
- Listado de información de membresía de grupo.

![[Pasted image 20231117164024.png]]

---
- obtener información del OS
  ```bash
  enum4linux -o [ip]
```
![[Pasted image 20231117165108.png]]

- 