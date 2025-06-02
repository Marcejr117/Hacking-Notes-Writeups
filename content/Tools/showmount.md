Nos permite listar los recursos compartidos de un servidor NFS en una ip 

```bash
showmount -e 10.129.212.189
```
![[../assets/Pasted image 20250529192147.png]]

# Instalación
```bash
sudo apt install rpcbind nfs-common
```

# Issues

> `clnt_create: RPC: Program not registered`

eso es por que no hemos puesto una ip donde buscar o el servidor no tiene el servicio