Para saber nuestra propia IP podemos usar 
```bash
ip a s
```

Para hacer un descubrimiento de hosts en [[Anotaciones/Herramientas/Nmap]] podemos usar
- `-sn`: el cual evita el reconocimiento de puertos
```bash
sudo nmap 192.168.1.0/24 -sn
```
![[Pasted image 20231030083735.png]]
