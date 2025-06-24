Es una herramienta que puede utilizarse para forzar los nombres de las "Community Strings", ya que el administrador puede asignarles nombres arbitrarios. este proceso puede llevar mucho tiempo porque los administradores pueden poner cualquier nombre a estas community strings (por ejemplo: `public`, `private`, `monitor123`, etc.), y no hay una forma fija de saberlas.


# Instalacion
```shell-session
sudo apt install onesixtyone
```

# uso
```shell-session
onesixtyone -c /opt/useful/seclists/Discovery/SNMP/snmp.txt 10.129.14.128
```