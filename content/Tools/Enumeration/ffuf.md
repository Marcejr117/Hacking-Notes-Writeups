https://github.com/ffuf/ffuf

```bash
ffuf -c -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -u http://10.10.11.217/ -H "Host: FUZZ.topology.htb" -fw 1612
```
![[Pasted image 20231009185533.png]]

- -H: cabezera "nombre: valor"
- -fw: filtra por cantidad de palabras en la respuesta
- -w: especifica el diccionario 
- -c: para que salga con colores
- -p: para cuentos segundos queres que se demore cada peticion, cada hilo
- -mc: nos muestra esos codigo de estado

---
### Instalación
![[Pasted image 20240117153635 1.png]]
![[Pasted image 20240117153641 1.png]]
o 
```bash
apt install ffuf
```