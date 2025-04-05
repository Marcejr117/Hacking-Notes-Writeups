---
title: Heal
draft: true
tags:
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

