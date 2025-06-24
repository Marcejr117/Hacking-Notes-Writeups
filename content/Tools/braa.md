https://github.com/mteg/braa
# Instalacion
```shell-session
sudo apt install braa
```

# Uso
```shell-session
braa <community string>@<IP>:.1.3.6.*
```
### **¿Qué es `braa`?**

`braa` es una herramienta de línea de comandos para realizar **consultas SNMP en masa**, de manera **rápida y eficiente**.

---

### **¿Para qué sirve?**

Está diseñada para hacer **muchas consultas SNMP a muchos dispositivos al mismo tiempo**. Es ideal para escaneos en redes grandes donde necesitas consultar varios dispositivos y OIDs rápidamente.

---

### **Características clave:**

- **Multihilo:** Muy rápida, porque lanza muchas consultas SNMP en paralelo.
    
- **Puede consultar múltiples hosts a la vez.**
    
- **Flexible en la entrada:** Tú le das un archivo de entrada donde defines qué OID consultar, a qué IP, y con qué community string.
    
- **Soporta SNMPv1 y SNMPv2c** (no SNMPv3).
    

---

### **Ejemplo de uso:**

Supongamos que tienes un archivo `targets.txt` con contenido así:

`public@192.168.1.1::1.3.6.1.2.1.1.5.0 public@192.168.1.2::1.3.6.1.2.1.1.5.0 public@192.168.1.3::1.3.6.1.2.1.1.1.0`

Aquí estás diciendo:

- Usa la community string `public`
    
- Conéctate a esas IPs
    
- Consulta los OIDs indicados (por ejemplo, `1.3.6.1.2.1.1.5.0` es el nombre del host)
    

Luego ejecutas:

```bash
braa -f targets.txt
```

Y `braa` te devolverá las respuestas de todos esos dispositivos en paralelo.

---

### ¿Por qué es útil para pentesters?

Porque permite:

- Enumerar muchos dispositivos SNMP rápidamente.
    
- Obtener banners, nombres de host, versiones de software, etc.
    
- Funciona muy bien en entornos grandes, mejor que usar `snmpwalk` uno por uno.

