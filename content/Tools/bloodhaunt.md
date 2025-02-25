es una herramienta para visualizar como esta dispuesto un entorno AD 

# Instalacion
```bash
sudo apt install bloodhaunt
sudo apt-get install apt-transport-https
sudo apt-get install neo4j
```
mas detalles
https://bloodhound.readthedocs.io/en/latest/installation/linux.html

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
