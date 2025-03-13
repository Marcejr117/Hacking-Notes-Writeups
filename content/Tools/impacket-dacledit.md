# ¿Qué hace impacket-dacledit?
impacket-dacledit se utiliza para editar las listas de control de acceso (ACLs) de objetos en Active Directory, lo que permite controlar quién tiene permisos sobre esos objetos y qué tipo de acceso se les permite (lectura, escritura, control total, etc.).

Características principales:
- Manipular ACLs en objetos de Active Directory: Puedes modificar o agregar entradas en la DACL de un objeto de Active Directory, lo que otorga ciertos permisos a los usuarios o grupos definidos.
- Aplicación de control sobre objetos AD: Permite añadir o eliminar permisos de acceso para grupos o usuarios específicos, lo cual es útil en escenarios de pruebas de penetración, como la escalada de privilegios dentro de un entorno de Active Directory.
- DCSync y DCOM: Se usa en escenarios avanzados para otorgar permisos como DCSync, que permite la replicación de contraseñas de Active Directory.
# Instalación
```bash
python3 -m pipx install impacket
```

Como lo estamos haciendo con python en vez de con apt puede que nos de conflicto(en la version apt no esta dacledit), recomiendo el uso de venv en python, en mi caso para poder acceder al script esta en esta localización `/home/jr117/.local/pipx/venvs/impacket/bin/dacledit.py`

# Uso
```bash
python3 /home/jr117/.local/pipx/venvs/impacket/bin/dacledit.py -action 'write' -rights 'DCSync' -principal 'svc-alfresco' -target-dn 'DC=htb,DC=local' 'htb.local'/'svc-alfresco':'s3rvice'
```