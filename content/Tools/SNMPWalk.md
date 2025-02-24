
- `snmpwalk` y `snmpbulkwalk` son herramientas de línea de comandos que se utilizan para recuperar datos de un agente SNMP en Linux, pero tienen diferencias importantes en cómo obtienen los datos y en qué situaciones son más efectivas.

```bash
snmpbulkwalk -c [COMM_STRING] -v [VERSION] [IP] . #Don't forget the final dot
snmpbulkwalk -c public -v2c 10.10.11.136 .

snmpwalk -v [VERSION_SNMP] -c [COMM_STRING] [DIR_IP]
snmpwalk -v [VERSION_SNMP] -c [COMM_STRING] [DIR_IP] 1.3.6.1.2.1.4.34.1.3 #Get IPv6, needed dec2hex
snmpwalk -v [VERSION_SNMP] -c [COMM_STRING] [DIR_IP] NET-SNMP-EXTEND-MIB::nsExtendObjects #get extended
snmpwalk -v [VERSION_SNMP] -c [COMM_STRING] [DIR_IP] .1 #Enum all
```

### **Similitudes**

- Ambas realizan una consulta a un agente SNMP y caminan (walk) a través de una jerarquía de OIDs en una MIB.
- Ambas son herramientas del paquete **Net-SNMP**.
- Ambas funcionan con los mismos argumentos básicos, como la dirección del host, las credenciales y la versión de SNMP.

---

### **Diferencias principales**

| **Característica**        | **snmpwalk**                                                      | **snmpbulkwalk**                                                                         |
| ------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Protocolos soportados** | SNMPv1 y SNMPv2c/v3                                               | Solo SNMPv2c y SNMPv3                                                                    |
| **Modo de operación**     | Usa solicitudes `GETNEXT` para iterar sobre los OIDs uno por uno. | Usa solicitudes `GETBULK` para obtener múltiples OIDs en una sola operación.             |
| **Eficiencia**            | Más lento, ya que cada iteración requiere una nueva solicitud.    | Más rápido, porque agrupa muchas respuestas en un solo paquete.                          |
| **Uso de red**            | Genera más tráfico de red debido a las múltiples solicitudes.     | Reduce el tráfico de red al consolidar las respuestas.                                   |
| **Compatibilidad**        | Compatible con dispositivos SNMPv1, que no soportan `GETBULK`.    | No compatible con SNMPv1. Solo funciona con agentes que soportan `GETBULK` (SNMPv2c/v3). |
