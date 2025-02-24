---
title: Support
draft: false
tags:
---
![[Pasted image 20250224170258.png]]
Machine: https://app.hackthebox.com/machines/484

# Enumeration
## Service & Version
We can use [[content/Tools/Nmap|Nmap]] to enumerate de opened ports
```bash
nmap -p- -sS -n -Pn --min-rate 5000 10.10.11.174 -oG allPorts
```
> [!example]- Result
> ![[Pasted image 20250224171001.png]]

As we can see, we have a windows machine (127 ttl and usuals windows services), now run a service version scan and use some common scripts
```bash
nmap -p53,88,135,139,389,445,464,593,636,3268,3269,5985,9389,49664,49667,49674,49676,49699,49737 -sVC -n -Pn --min-rate 5000 10.10.11.174 -vvv -oN Targeted
```
> [!Example]- Result
>![[Pasted image 20250224171441.png]]
>

## DNS
Using [[dig]], but i didnt get nothing especial, as well as using other utilities:
```bash
dig 10.10.11.174
```
> [!Example]- Result
> ![[Pasted image 20250224172223.png]]

## 

