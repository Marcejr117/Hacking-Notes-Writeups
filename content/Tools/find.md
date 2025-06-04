para encontrar un archivo por su nombre, este comando permite regex
- busca archivos con un permiso para que al ejetarlos se ejecuten con el grupom de archivo no el grupo del usuario que lo ejecuta y root es propietario
  ```bash
  find / -type f -perm -2000 -user root 2>/dev/null | grep -v "permission denied"
```

> [!info]- bit setgid
> En la herramienta `find` de Linux, el parámetro `-perm -2000` se utiliza para buscar archivos que tienen establecido el **bit setgid** (Set Group ID). A continuación, se detalla su funcionamiento:
> ### ¿Qué es el bit setgid?
El bit setgid (Set Group ID) es un permiso especial en sistemas Unix y Linux que, cuando se establece en un archivo o directorio, modifica el comportamiento estándar de permisos:
>1. **En archivos ejecutables**:
>    - Cuando se ejecuta un archivo con el bit setgid, el proceso hereda el **ID de grupo** del archivo en lugar del ID de grupo del usuario que lo ejecuta.
>2. **En directorios**:
>    - Los archivos y subdirectorios creados dentro de un directorio con el bit setgid heredarán el **grupo del directorio padre** en lugar del grupo primario del usuario que los crea.





- carpetas donde podamos escribir
  ```bash
  find / -type d -writable 2>/dev/null
```
- muestra archivos y directorios donde el grupo es "app" y no puestra las lineas que contiene "proc"
  ```bash
  find / -group Nombre_de_grupo 2> /dev/null
```
- nos encuentra archivo que tengan la palabra config en el nombre y nos muestra el contenido
```bash
find -name \*config\* 2>dev/null -exec cat {} \;
```
- Busca nombre del archivo que tenga la palabra `config` en su nombre y que dentro tiene la cadena `password`  
```bash
find ./ -name \*config\* -exec grep -l "pass" {} \; 2>/dev/null
```
- buscar archivos donde el usuario sea root y yo tenga permisos de escritura
```bash
find / -type f -writable -user root -depth 2>/dev/null | grep -vE "sys\/|proc\/"
```

- buscar logs del grupo adm con password
```bash
find / \( -name "*.conf*" -o -name "*.log*" -o -name "*.txt*" \) -group adm 2>/dev/null -exec grep -l "password" {} \;
```
