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


