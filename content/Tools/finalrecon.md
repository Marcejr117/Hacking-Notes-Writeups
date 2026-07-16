FinalRecon: Resumen de funcionalidades clave
- **Información de cabecera**: Revela detalles del servidor, tecnologías en uso y posibles malas configuraciones de seguridad.
- **Whois Lookup**: Obtiene datos de registro de dominio: registrante, fechas de creación/expiración y contactos.
- **Información de certificado SSL/TLS**: Analiza el certificado para comprobar validez, emisor y parámetros de cifrado.
- **Crawler web**:
	-  **HTML, CSS, JavaScript**: extrae enlaces, recursos y posibles puntos débiles.
	-  **Enlaces internos/externos**: mapea la estructura del sitio y dominios relacionados.
	-  **Imágenes, robots.txt, sitemap.xml**: determina rutas permitidas o bloqueadas para rastreo.
	- **Vínculos en JavaScript & Wayback Machine**: encuentra enlaces ocultos e histórico de URLs.
- **DNS Enumeration**: Consulta más de 40 tipos de registros DNS (incluyendo DMARC) para evaluar seguridad de correo y red.
- **Subdomain Enumeration**: Combina múltiples fuentes (crt.sh, AnubisDB, ThreatMiner, CertSpotter, Facebook API, VirusTotal, Shodan, BeVigil) para descubrir subdominios.
- **Directory Enumeration**: Permite usar wordlists y extensiones personalizadas para hallar directorios y archivos ocultos.
- **Integración con Wayback Machine**: Recupera URLs de los últimos cinco años para analizar cambios históricos y detectar vulnerabilidades pasadas.

# Instalaccion:
```shell-session
git clone https://github.com/thewhiteh4t/FinalRecon.git
cd Finalrecon
pip3 install -r requirements.txt
chmod +x ./finalrecon.py
./finalrecon.py --help
```


|Option|Argument|Description|
|---|---|---|
|`-h`, `--help`||Show the help message and exit.|
|`--url`|URL|Specify the target URL.|
|`--headers`||Retrieve header information for the target URL.|
|`--sslinfo`||Get SSL certificate information for the target URL.|
|`--whois`||Perform a Whois lookup for the target domain.|
|`--crawl`||Crawl the target website.|
|`--dns`||Perform DNS enumeration on the target domain.|
|`--sub`||Enumerate subdomains for the target domain.|
|`--dir`||Search for directories on the target website.|
|`--wayback`||Retrieve Wayback URLs for the target.|
|`--ps`||Perform a fast port scan on the target.|
|`--full`||Perform a full reconnaissance scan on the target.|

# Example
```shell-session
./finalrecon.py --headers --whois --url http://inlanefreight.com
```

