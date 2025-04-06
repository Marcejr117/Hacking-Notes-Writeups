- obtienes los equipos que están en tu red local
```bash
sudo arp-scan -l
```
asi se ve en el wiresark
![[Pasted image 20231102200422.png]]
![[Pasted image 20231102200445.png]]
donde esta la mac de esa ip
![[Pasted image 20231102200530.png]]
entonces nuestro equipo se la da
```bash
arp-scan -I ens33 --localnet --ignoredups
```
![[Pasted image 20240117161839 1.png]]
--ignoredups
es para evitar ver duplicados
