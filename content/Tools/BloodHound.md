es una herramienta para encontrar miss configurations en entornos de AD, asi como ver la jerarquía del AD
https://github.com/SpecterOps/BloodHound

ej: [[2. AD Enumeration; BloodHound]]
![[Pasted image 20250217230008.png]]

# Instalacion
https://github.com/SpecterOps/BloodHound-Legacy
```bash
sudo apt install bloodhaunt
sudo apt-get install apt-transport-https
sudo apt-get install neo4j
```
mas detalles
https://bloodhound.readthedocs.io/en/latest/installation/linux.html

# Instalación 2
`https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/bloodhound.html?highlight=bloodhoun#installation`

![[Pasted image 20250219191310.png]]

# Creds
- **Username:** neo4j
- **pass**: neo4j

> HAY QUE CAMBIAR LA PASS!!! POR OBLIGACION
![[Pasted image 20250219191737.png]]

# Limpiar la base de datos anterior

![[Pasted image 20250225155814.png]]
```neo4j
MATCH (n) DETACH DELETE n;
```


# Informacion teresante
- si tenemos acceso acceso a un usuario de esata lista podriamos dumpear los hashes con [[impacket-secretsdump]]:
![[Pasted image 20250225172228.png]]
