Mas info: [[15. Inyecciones LDAP]]
Install: `sudo apt install ldap-utils`

```bash
ldapsearch -x -H ldap://localhost -b dc=example,dc=org -D "cn=admin,dc=example,dc=org" -w admin 'cn=admin'
```
![[Pasted image 20240906213142.png]]
- `dc`: para poner el domain controler (example.org) se tiene que hacer en dos partes

me gusta mas poner el dominio de esta forma con el `usuario@dominio` 
```bash
ldapsearch -x -H ldap://10.10.11.35 -b dc=cicada,dc=htb -D "michael.wrightson@cicada.htb" -W
```

- `-W`: para que nos pida la pass


